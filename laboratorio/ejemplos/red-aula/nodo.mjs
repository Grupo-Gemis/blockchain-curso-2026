import {createServer} from 'node:http'
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises'
import {randomBytes} from 'node:crypto'
import {networkInterfaces} from 'node:os'
import {fileURLToPath} from 'node:url'
import path from 'node:path'
import {eth, copy, hash, sign, stable, checkTransaction, effectiveTip, nextBaseFee,
  selectByTip, buildBlock, blockBody, checkBlock} from './modelo.mjs'
import {invitation, checkManifest, makeManifest, peerContext, checkProposal,
  decisionBody, checkDecision, roundHash} from './pares.mjs'

const root=fileURLToPath(new URL('.',import.meta.url))
async function readJSON(file) {
  try {return JSON.parse(await readFile(file,'utf8'))}
  catch(error) {if(error.code === 'ENOENT') return null; throw error}
}
async function atomicJSON(file,value) {
  await writeFile(file+'.tmp',JSON.stringify(value,null,2)+'\n',{mode:0o600})
  await rename(file+'.tmp',file)
}
export async function createPeer(options) {
  if (!Number.isInteger(options.slot) || options.slot<1 || options.slot>60) throw Error('El número de nodo debe estar entre 1 y 60.')
  await mkdir(options.dataDir,{recursive:true,mode:0o700})
  const keyFile=path.join(options.dataDir,'identidad.json'), stateFile=path.join(options.dataDir,'estado.json')
  let secret=await readJSON(keyFile)
  if (!secret) {
    const wallet=eth.Wallet.createRandom()
    secret={slot:options.slot,privateKey:wallet.privateKey,controlKey:randomBytes(24).toString('hex'),
      invitation:await invitation(wallet,options.slot,options.name || 'Nodo '+options.slot,options.url)}
    await atomicJSON(keyFile,secret)
  }
  if(secret.slot!==options.slot || secret.invitation.url!==new URL(options.url).origin) throw Error('Esta carpeta pertenece a otra identidad o dirección. Conservá sus datos y usá otra carpeta para una red nueva.')
  const wallet=new eth.Wallet(secret.privateKey)
  const state=(await readJSON(stateFile)) || {manifest:null,ledger:[],pending:[],proposal:null,decisions:[],localChoices:{},events:[]}
  const peers=new Map()
  let context=null, closed=false, interval, syncing=null, queue=Promise.resolve()
  const exclusive=action=>{
    const result=queue.then(action)
    queue=result.catch(()=>{})
    return result
  }
  const event=(kind,detail)=>{
    state.events.push({at:new Date().toISOString(),slot:context?.slot || 0,kind,detail})
    if(state.events.length>80) state.events.shift()
  }
  const validateOwnManifest=manifest=>{
    checkManifest(manifest)
    const own=manifest.participants.find(p=>p.slot===secret.slot)
    if(stable(own)!==stable(secret.invitation)) throw Error('El archivo de red no contiene la invitación de esta identidad. No copies la carpeta privada de otro estudiante.')
  }
  const persist=()=>atomicJSON(stateFile,state)
  const recalculate=()=>{context=state.manifest ? peerContext(state.manifest,state.ledger) : null}
  const blockContext=()=>({parent:context.chain.at(-1),accounts:context.accounts,slot:context.slot,
    seed:state.manifest.seed,participants:state.manifest.participants,config:state.manifest.config})
  if(state.manifest) {
    validateOwnManifest(state.manifest)
    recalculate()
    if(state.proposal) checkProposal(state.proposal,state.manifest,context)
    for(const decision of state.decisions) checkDecision(decision,state.manifest,context.slot,context.roundParent)
  }
  const publicState=()=>({networkId:state.manifest?.hash || null,ledger:copy(state.ledger),pending:copy(state.pending),
    proposal:copy(state.proposal),decisions:copy(state.decisions)})
  const snapshot=()=>({...publicState(),mode:'pares',model:'Red didáctica entre pares con miembros conocidos y peso igual. No ejecuta Ethereum.',
    manifest:copy(state.manifest),invitation:copy(secret.invitation),local:{slot:secret.slot,name:secret.invitation.name,address:wallet.address},
    slot:context?.slot || 0,proposer:context?.proposer || null,roundParent:context?.roundParent || null,
    accounts:copy(context?.accounts || {}),chain:copy(context?.chain || []),events:copy(state.events),
    peers:state.manifest?.participants.map(p=>({...p,...peers.get(p.slot),self:p.slot===secret.slot})) || []})
  function admitTransaction(tx) {
    checkTransaction(tx,state.manifest.participants,state.manifest.config)
    const account=context.accounts[tx.body.from]
    if(tx.body.nonce < account.nonce || tx.body.nonce>account.nonce+20) return false
    const maximum=BigInt(tx.body.value)+BigInt(tx.body.gasLimit)*BigInt(tx.body.maxFeePerGas)
    if(BigInt(account.balance)<maximum) throw Error('El saldo no cubre el máximo autorizado.')
    if(state.pending.some(p=>p.id===tx.id)) return false
    const previous=state.pending.find(p=>p.body.from===tx.body.from && p.body.nonce===tx.body.nonce)
    if(previous) {
      const bump=value=>(BigInt(value)*110n+99n)/100n
      if(BigInt(tx.body.maxFeePerGas)<bump(previous.body.maxFeePerGas) || BigInt(tx.body.maxPriorityFeePerGas)<bump(previous.body.maxPriorityFeePerGas)) return false
      state.pending=state.pending.filter(p=>p!==previous)
    }
    if(state.pending.length>=Math.max(100,state.manifest.config.count*4)) throw Error('La cola local llegó al límite de la práctica.')
    state.pending.push(copy(tx))
    return true
  }
  function acceptDecision(vote) {
    checkDecision(vote,state.manifest,context.slot,context.roundParent)
    const previous=state.decisions.find(v=>v.body.voter===vote.body.voter)
    if(previous) {
      if(previous.body.choice!==vote.body.choice) event('conflicto','Se descartó una segunda decisión de N'+vote.body.voter+' en el mismo turno.')
      return false
    }
    if(vote.body.choice!=='skip') {
      if(vote.body.choice!==state.proposal?.body.block.hash) return false
      checkBlock(state.proposal.body.block,blockContext())
    }
    state.decisions.push(copy(vote))
    return true
  }
  function certify() {
    const choices=[...new Set(state.decisions.map(v=>v.body.choice))]
    for(const choice of choices) {
      const certificate=state.decisions.filter(v=>v.body.choice===choice)
      if(certificate.length<state.manifest.config.quorum) continue
      const block=choice==='skip'?null:state.proposal?.body.block
      if(choice!=='skip' && block?.hash!==choice) continue
      const record={slot:context.slot,roundParent:context.roundParent,choice,block:copy(block),certificate:copy(certificate),
        hash:roundHash(state.manifest,context.slot,context.roundParent,choice)}
      // El mismo verificador reconstruye TODO el historial antes de incorporarlo.
      peerContext(state.manifest,[...state.ledger,record])
      state.ledger.push(record)
      event(choice==='skip'?'turno-omitido':'certificado',choice==='skip'?'El grupo pasó el turno con un certificado de firmas.':'El grupo certificó el bloque '+block.height+'.')
      state.proposal=null
      state.decisions=[]
      recalculate()
      state.pending=state.pending.filter(tx=>tx.body.nonce>=context.accounts[tx.body.from].nonce)
      return true
    }
    return false
  }
  async function merge(incoming) {
    if(!state.manifest || incoming?.networkId!==state.manifest.hash) throw Error('El mensaje pertenece a otra red.')
    if(!Array.isArray(incoming.ledger) || !Array.isArray(incoming.pending) || !Array.isArray(incoming.decisions) || incoming.pending.length>Math.max(100,state.manifest.config.count*4) || incoming.decisions.length>state.manifest.config.count) throw Error('Mensaje fuera de los límites de la práctica.')
    if(incoming.ledger.length>state.ledger.length) {
      const verified=peerContext(state.manifest,incoming.ledger)
      if(state.ledger.some((record,i)=>record.hash!==incoming.ledger[i].hash)) throw Error('Se detectó un historial certificado incompatible. Se conservó la copia local.')
      state.ledger=copy(incoming.ledger)
      state.proposal=null
      state.decisions=[]
      context=verified
      state.pending=state.pending.filter(tx=>tx.body.nonce>=context.accounts[tx.body.from].nonce)
      event('sincronizacion','Historial reconstruido desde génesis con certificados verificados. Turnos: '+state.ledger.length+'.')
    }
    for(const tx of incoming.pending) {try {admitTransaction(tx)} catch {}}
    if(incoming.ledger.length===state.ledger.length && incoming.ledger.every((r,i)=>r.hash===state.ledger[i].hash)) {
      if(incoming.proposal) {
        try {
          checkProposal(incoming.proposal,state.manifest,context)
          if(!state.proposal) state.proposal=copy(incoming.proposal)
          else if(state.proposal.body.block.hash!==incoming.proposal.body.block.hash) event('conflicto','El proponente difundió propuestas distintas. No se firma dos veces.')
        } catch {}
      }
      for(const vote of incoming.decisions) {try {acceptDecision(vote)} catch {}}
      certify()
    }
    await persist()
  }
  async function syncOnce() {
    if(closed || !state.manifest) return
    if(syncing) return syncing
    const snapshot=publicState()
    syncing=Promise.allSettled(state.manifest.participants.filter(p=>p.slot!==secret.slot).map(async peer=>{
      try {
        const response=await fetch(peer.url+'/peer/sync',{method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify(snapshot),signal:AbortSignal.timeout(options.timeout || 1800)})
        const incoming=await response.json()
        if(!response.ok) throw Error(incoming.error || 'El par no aceptó el mensaje.')
        await exclusive(()=>merge(incoming))
        peers.set(peer.slot,{online:true,lastSeen:new Date().toISOString()})
      } catch(error) {peers.set(peer.slot,{online:false,error:error.message})}
    })).finally(()=>{syncing=null})
    return syncing
  }
  async function loadManifest(manifest) {
    validateOwnManifest(manifest)
    if(state.manifest && state.manifest.hash!==manifest.hash) throw Error('Esta identidad ya tiene una red. Conservá sus datos y usá una carpeta nueva para otro curso.')
    if(!state.manifest) {
      state.manifest=copy(manifest)
      recalculate()
      event('genesis','Configuración común verificada. '+manifest.config.count+' nodos y '+manifest.config.quorum+' firmas por decisión.')
      await persist()
    }
  }
  if(options.manifest) await loadManifest(options.manifest)
  async function localAction(route,input) {
    if(route==='create-network') return makeManifest(input.invitations,randomBytes(16).toString('hex'),input.name || 'Red de aula')
    if(route==='load') {await loadManifest(input.manifest);return snapshot()}
    if(!state.manifest) throw Error('Primero cargá el mismo archivo de red que el resto del curso.')
    if(state.ledger.length>=200) throw Error('Finalizaron los 200 turnos de esta sesión. Guardá la evidencia y prepará otra red.')
    if(['propose','vote','skip'].includes(route)) {
      if(input.expectedSlot!==context.slot || input.roundParent!==context.roundParent) throw Error('El turno ya cambió. Revisá la copia actual antes de decidir.')
      if(route==='vote' && input.blockHash!==state.proposal?.body.block.hash) throw Error('La propuesta cambió. Comprobá el bloque actual antes de aprobar.')
    }
    if(route==='send') {
      const body={chainId:state.manifest.config.chainId,from:secret.slot,to:input.to,nonce:input.nonce,
        value:eth.parseEther(input.value).toString(),gasLimit:21000,maxFeePerGas:eth.parseUnits(input.max,9).toString(),maxPriorityFeePerGas:eth.parseUnits(input.tip,9).toString()}
      const tx={body,signature:await sign(wallet,body)}
      tx.id=hash(tx)
      if(!admitTransaction(tx)) throw Error('Nonce consumido o reemplazo sin subir ambos topes al menos 10%.')
      event('transaccion','Transferencia firmada y agregada a la cola local. Se difundirá a los pares.')
    } else if(route==='propose') {
      if(context.proposer!==secret.slot || state.proposal) throw Error('Solo el proponente asignado puede difundir una propuesta por turno.')
      const ids=input.ids
      if(ids && (!Array.isArray(ids) || ids.length>3 || new Set(ids).size!==ids.length)) throw Error('Elegí hasta tres operaciones distintas.')
      const transactions=ids?ids.map(id=>{const tx=state.pending.find(t=>t.id===id);if(!tx) throw Error('La operación ya no está pendiente.');return tx}):selectByTip(state.pending,blockContext())
      const block=buildBlock({...blockContext(),transactions})
      if(input.corrupt) {block.stateRoot='0x'+'0'.repeat(64);block.hash=hash(blockBody(block))}
      block.signature=await sign(wallet,{hash:block.hash})
      const body={kind:'proposal',networkId:state.manifest.hash,slot:context.slot,roundParent:context.roundParent,block}
      state.proposal={body,signature:await sign(wallet,body)}
      event('propuesta','Propuesta firmada. Cada par debe comprobarla antes de votar.')
    } else if(route==='check') {
      if(!state.proposal) throw Error('Todavía no recibiste una propuesta.')
      checkBlock(state.proposal.body.block,blockContext())
      return {valid:true,hash:state.proposal.body.block.hash,message:'Firma, enlace, gas, nonces, saldos y huella del estado coinciden con la ejecución local.'}
    } else if(route==='vote' || route==='skip') {
      if(state.localChoices[context.roundParent]) throw Error('Este nodo ya firmó una decisión para este turno. La restricción se conserva al reiniciar.')
      const choice=route==='skip'?'skip':state.proposal?.body.block.hash
      if(!choice) throw Error('Esperá una propuesta o solicitá pasar el turno.')
      if(choice!=='skip') checkBlock(state.proposal.body.block,blockContext())
      const body=decisionBody(state.manifest,context.slot,context.roundParent,choice,secret.slot)
      const vote={body,signature:await sign(wallet,body)}
      state.localChoices[context.roundParent]=choice
      acceptDecision(vote)
      event('decision',choice==='skip'?'Se firmó pasar el turno. Se necesita el mismo quórum que para un bloque.':'Se firmó aprobar esta propuesta.')
      certify()
    } else throw Error('Acción inexistente.')
    await persist()
    return snapshot()
  }
  const json=(response,data,status=200)=>{
    response.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'})
    response.end(JSON.stringify(data))
  }
  const server=createServer(async(request,response)=>{
    try {
      const url=new URL(request.url,'http://localhost')
      if(request.method==='GET' && ['/api/state','/api/export'].includes(url.pathname)) return json(response,snapshot())
      if(request.method==='POST' && (url.pathname==='/peer/sync' || url.pathname.startsWith('/api/'))) {
        if(url.pathname.startsWith('/api/') && request.headers['x-control-key']!==secret.controlKey) throw Error('Abrí el acceso de control local que muestra tu propia terminal.')
        let text=''
        for await(const chunk of request) {text+=chunk;if(text.length>8000000) throw Error('Mensaje demasiado grande.')}
        const input=JSON.parse(text || '{}')
        if(url.pathname==='/peer/sync') {
          await exclusive(()=>merge(input))
          return json(response,publicState())
        }
        const result=await exclusive(()=>localAction(url.pathname.slice(5),input))
        json(response,result)
        if(options.autoSync!==false) void syncOnce()
        return
      }
      const files={'/guia-pares':['NODOS-INDEPENDIENTES.md','text/plain'],'/':['p2p.html','text/html'],'/p2p.html':['p2p.html','text/html'],
        '/p2p.js':['p2p.js','text/javascript'],'/styles.css':['styles.css','text/css'],
        '/modelo.mjs':['modelo.mjs','text/javascript'],'/pares.mjs':['pares.mjs','text/javascript'],
        '/vendor/ethers.umd.cjs':['vendor/ethers.umd.cjs','text/javascript']}
      if(request.method!=='GET' || !files[url.pathname]) return json(response,{error:'Archivo inexistente.'},404)
      const [file,type]=files[url.pathname]
      response.writeHead(200,{'Content-Type':type+'; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'})
      response.end(await readFile(path.join(root,file)))
    } catch(error) {json(response,{error:error.message},400)}
  })
  return {server,controlKey:secret.controlKey,invitation:copy(secret.invitation),snapshot,syncOnce,
    async listen(port,host='0.0.0.0') {
      await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,host,resolve)})
      if(options.autoSync!==false) interval=setInterval(()=>{void syncOnce()},options.interval || 1500)
      return server.address()
    },async close() {
      closed=true
      clearInterval(interval)
      if(syncing) await syncing
      await queue
      server.closeAllConnections()
      if(server.listening) await new Promise(resolve=>server.close(resolve))
      await persist()
    }}
}

if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  if(Number(process.versions.node.split('.')[0])<24) throw Error('Esta práctica requiere Node.js 24 LTS o posterior.')
  const arg=(name,fallback)=>{const i=process.argv.indexOf(name);return i<0?fallback:process.argv[i+1]}
  const port=Number(arg('--puerto','4781')), slot=Number(arg('--id','1'))
  if(!Number.isInteger(port) || port<1024 || port>65535) throw Error('Puerto inválido.')
  const lan=Object.values(networkInterfaces()).flat().find(n=>n.family==='IPv4' && !n.internal)?.address || '127.0.0.1'
  const dataDir=path.resolve(arg('--datos','datos-nodo-'+slot))
  const manifestFile=arg('--red',null)
  const peer=await createPeer({slot,name:arg('--nombre','Nodo '+slot),url:arg('--anunciar','http://'+lan+':'+port),dataDir,
    ...(manifestFile?{manifest:JSON.parse(await readFile(manifestFile,'utf8'))}:{})})
  try {await peer.listen(port)}
  catch(error) {console.error(error.code==='EADDRINUSE'?'El puerto está ocupado. No se detuvo el otro proceso.':error.message);process.exitCode=1;await peer.close()}
  if(peer.server.listening) {
    await writeFile(path.join(dataDir,'invitacion.json'),JSON.stringify(peer.invitation,null,2)+'\n')
    console.log('Nodo independiente '+slot+'. Datos privados en '+dataDir)
    console.log('Mi dirección entre pares: '+peer.invitation.url)
    console.log('Mi control local: http://127.0.0.1:'+port+'/#control='+peer.controlKey)
    console.log('Compartí solo invitacion.json. Cada estudiante debe crear su propia identidad.')
    console.log('Cargá el mismo red.json que tus compañeros. Ctrl+C detiene solo este nodo.')
    for(const signal of ['SIGINT','SIGTERM']) process.once(signal,async()=>{await peer.close()})
  }
}
