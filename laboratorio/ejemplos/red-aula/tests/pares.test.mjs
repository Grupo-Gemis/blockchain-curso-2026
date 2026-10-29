import test from 'node:test'
import assert from 'node:assert/strict'
import {createServer} from 'node:net'
import {mkdtemp,readFile,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {createPeer} from '../nodo.mjs'
import {makeManifest,checkManifest,peerContext} from '../pares.mjs'
import {copy,hash} from '../modelo.mjs'

async function port() {
  const socket=createServer()
  await new Promise(resolve=>socket.listen(0,'127.0.0.1',resolve))
  const value=socket.address().port
  await new Promise(resolve=>socket.close(resolve))
  return value
}
test('Pares independientes: caída, paso colectivo, recuperación, persistencia y rechazo de alteraciones',async()=>{
  const directory=await mkdtemp(path.join(tmpdir(),'blockchain-pares-'))
  const peers=[],options=[]
  const request=async(index,route,input,authenticated=true)=>{
    if(['propose','vote','skip'].includes(route)) {
      const current=peers[index].snapshot()
      input={expectedSlot:current.slot,roundParent:current.roundParent,blockHash:current.proposal?.body.block.hash,...input}
    }
    const response=await fetch(options[index].url+'/api/'+route,{method:input?'POST':'GET',headers:{'Content-Type':'application/json',...(authenticated?{'x-control-key':peers[index].controlKey}:{})},...(input?{body:JSON.stringify(input)}:{})})
    const value=await response.json()
    if(!response.ok) throw Error(value.error)
    return value
  }
  const sync=async()=>{for(let cycle=0;cycle<3;cycle++) await Promise.all(peers.filter(p=>p.server.listening).map(p=>p.syncOnce()))}
  try {
    for(let i=0;i<4;i++) {
      const number=await port()
      options[i]={slot:i+1,url:'http://127.0.0.1:'+number,name:'Estudiante '+(i+1),dataDir:path.join(directory,'nodo-'+(i+1)),autoSync:false,timeout:200}
      peers[i]=await createPeer(options[i])
      await peers[i].listen(number,'127.0.0.1')
    }
    const manifest=makeManifest(peers.map(p=>p.invitation),'semilla-conocida','Curso de prueba')
    assert.equal(manifest.config.quorum,3)
    const bad=copy(manifest);bad.config.quorum=2;const {hash:ignored,...body}=bad;bad.hash=hash(body)
    assert.throws(()=>checkManifest(bad),/Configuración/)
    const duplicate=copy(manifest.participants);duplicate[1]=duplicate[0]
    assert.throws(()=>makeManifest(duplicate,'otra'),/identidades/)
    await assert.rejects(request(0,'load',{manifest},false),/control local/)
    for(let i=0;i<4;i++) await request(i,'load',{manifest})
    assert.equal(new Set(peers.map(p=>p.snapshot().chain[0].hash)).size,1)
    const first=peers[0].snapshot().proposer-1
    await request((first+1)%4,'send',{to:first+1,nonce:0,value:'0.01',max:'100',tip:'2'})
    await sync()
    assert.ok(peers.every(p=>p.snapshot().pending.length===1))
    await request(first,'propose',{})
    await sync()
    assert.ok(peers.every(p=>p.snapshot().proposal))
    await request(0,'vote',{})
    await sync()
    assert.ok(peers.every(p=>p.snapshot().chain.length===1))
    // Una decisión parcial sobrevive a detener y arrancar el proceso con sus datos.
    await peers[0].close()
    peers[0]=await createPeer(options[0]);await peers[0].listen(new URL(options[0].url).port,'127.0.0.1')
    await assert.rejects(request(0,'skip',{}),/ya firmó/)
    await request(1,'vote',{});await request(2,'vote',{})
    await sync()
    assert.ok(peers.every(p=>p.snapshot().chain.length===2))
    const accounts=hash(peers[0].snapshot().accounts)
    await sync()
    assert.ok(peers.every(p=>hash(p.snapshot().accounts)===accounts))
    // La caída del proponente no impide que los otros tres certifiquen pasar el turno.
    const absent=peers[0].snapshot().proposer-1
    const survivors=[0,1,2,3].filter(i=>i!==absent)
    await peers[absent].close()
    for(const i of survivors) await request(i,'skip',{})
    await sync()
    assert.ok(survivors.every(i=>peers[i].snapshot().slot===3))
    assert.ok(survivors.every(i=>peers[i].snapshot().chain.length===2))
    const nextProposer=peers[survivors[0]].snapshot().proposer-1
    assert.notEqual(nextProposer,absent)
    await request(nextProposer,'propose',{})
    await sync()
    for(const i of survivors) await request(i,'vote',{})
    await sync()
    assert.ok(survivors.every(i=>peers[i].snapshot().chain.length===3))
    // Se reconstruye la copia atrasada sin copiar archivos privados ni confiar en un servidor.
    peers[absent]=await createPeer(options[absent]);await peers[absent].listen(new URL(options[absent].url).port,'127.0.0.1')
    await sync()
    const histories=peers.map(p=>p.snapshot())
    assert.equal(new Set(histories.map(p=>p.chain.at(-1).hash)).size,1)
    assert.equal(new Set(histories.map(p=>hash(p.accounts))).size,1)
    const altered=copy(histories[0].ledger);altered[0].block.stateRoot='0x'+'0'.repeat(64)
    assert.throws(()=>peerContext(manifest,altered),/ejecución independiente/)
    const duplicated=copy(histories[0].ledger);duplicated[0].certificate[1]=duplicated[0].certificate[0]
    assert.throws(()=>peerContext(manifest,duplicated),/dos veces/)
    const proposer=histories[0].proposer-1
    await request(proposer,'propose',{corrupt:true})
    await sync()
    await assert.rejects(request(0,'vote',{}),/ejecución independiente/)
    for(let i=0;i<3;i++) await request(i,'skip',{})
    await sync()
    assert.ok(peers.every(p=>p.snapshot().chain.length===3))
    assert.ok(peers.every(p=>p.snapshot().slot===5))
    // Los secretos no salen por exportación ni por archivos estáticos.
    const evidence=JSON.stringify(await request(0,'export'))
    for(const p of peers) assert.ok(!evidence.includes(p.controlKey))
    const secrets=JSON.parse(await readFile(path.join(options[0].dataDir,'identidad.json'),'utf8'))
    assert.ok(!evidence.includes(secrets.privateKey))
    for(const file of ['nodo.mjs','datos-nodo-1/identidad.json','estado.json']) assert.equal((await fetch(options[0].url+'/'+file)).status,404)
    const wrong=await fetch(options[0].url+'/peer/sync',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({networkId:'otra-red',ledger:[],pending:[],decisions:[]})})
    assert.equal(wrong.status,400)
    assert.equal(peers[0].snapshot().slot,5)
    await assert.rejects(request(0,'skip',{expectedSlot:1}),/turno ya cambió/)
  } finally {
    await Promise.all(peers.filter(p=>p.server.listening).map(p=>p.close()))
    await rm(directory,{recursive:true,force:true})
  }
})
