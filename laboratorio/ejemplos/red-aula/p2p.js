import {eth,hash,copy,checkBlock,nextBaseFee,effectiveTip,selectByTip} from './modelo.mjs'
import {checkManifest,peerContext} from './pares.mjs'
const $=id=>document.getElementById(id)
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')
const short=value=>value?value.slice(0,12)+'…'+value.slice(-6):'—'
const ether=value=>Number(eth.formatEther(value)).toLocaleString('es-AR',{maximumFractionDigits:8})
const gwei=value=>Number(eth.formatUnits(value,9)).toLocaleString('es-AR',{maximumFractionDigits:5})
let key=new URLSearchParams(location.hash.slice(1)).get('control') || sessionStorage.getItem('pares-control')
if(key) {sessionStorage.setItem('pares-control',key);history.replaceState(null,'',location.pathname)}
let state,context,checked,verified='',selected=[],shownCount,busy=false
function message(text) {$('message').textContent=text;$('message').hidden=false}
async function api(route,value) {
  const response=await fetch('/api/'+route,{method:value?'POST':'GET',headers:{'Content-Type':'application/json',...(key?{'x-control-key':key}:{})},...(value?{body:JSON.stringify(value)}:{})})
  const data=await response.json()
  if(!response.ok) throw Error(data.error || 'No se pudo completar la solicitud.')
  return data
}
async function act(action) {
  if(busy) return
  busy=true
  try {await action();$('message').hidden=true;await refresh()}
  catch(error) {message(error.message)}
  finally {busy=false}
}
function download(value,name) {
  const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)+'\n'],{type:'application/json'}))
  const link=document.createElement('a');link.href=url;link.download=name;link.click()
  setTimeout(()=>URL.revokeObjectURL(url),1000)
}
function blockContext() {return {parent:context.chain.at(-1),accounts:context.accounts,slot:context.slot,seed:state.manifest.seed,participants:state.manifest.participants,config:state.manifest.config}}
$('download-invitation').onclick=()=>download(state.invitation,'invitacion-'+state.local.slot+'.json')
$('create-network').onclick=()=>act(async()=>{
  const text=$('invitations').value.trim()
  const invitations=text.startsWith('[')?JSON.parse(text):text.split('\n').filter(line=>line.trim()).map(line=>JSON.parse(line))
  const manifest=await api('create-network',{invitations,name:$('course-name').value})
  download(manifest,'red.json')
})
$('load-file').onchange=()=>act(async()=>{
  const file=$('load-file').files[0]
  if(file) await api('load',{manifest:JSON.parse(await file.text())})
})
$('nonce').oninput=()=>{$('nonce').dataset.dirty='true'}
$('send-form').onsubmit=event=>{event.preventDefault();act(async()=>{
  await api('send',{to:Number($('to').value),nonce:Number($('nonce').value),value:$('value').value,max:$('max').value,tip:$('tip').value})
  delete $('nonce').dataset.dirty
})}
$('pending').onchange=event=>{
  const id=event.target.dataset.transaction
  if(id) selected=event.target.checked?[...new Set([...selected,id])]:selected.filter(value=>value!==id)
}
$('suggest').onclick=()=>act(async()=>{selected=selectByTip(state.pending,blockContext()).map(tx=>tx.id)})
$('propose').onclick=()=>act(()=>api('propose',{ids:selected,corrupt:$('corrupt').checked,expectedSlot:state.slot,roundParent:state.roundParent}))
$('check').onclick=()=>{
  try {checkBlock(state.proposal.body.block,blockContext());checked={hash:state.proposal.body.block.hash,valid:true,message:'La ejecución local coincide. Firmas, enlace, gas, nonces, saldos y estado comprobados.'}}
  catch(error) {checked={hash:state.proposal?.body.block.hash,valid:false,message:'Rechazar: '+error.message}}
  render()
}
$('approve').onclick=()=>act(async()=>{
  if(!checked?.valid || checked.hash!==state.proposal?.body.block.hash) throw Error('Comprobá esta propuesta antes de firmar.')
  await api('vote',{expectedSlot:state.slot,roundParent:state.roundParent,blockHash:checked.hash})
})
$('skip').onclick=()=>act(()=>api('skip',{expectedSlot:state.slot,roundParent:state.roundParent}))
$('export').onclick=()=>download({...copy(state),browserVerified:!verified},'evidencia-pares-nodo-'+state.local.slot+'.json')
async function refresh() {
  try {
    const next=await api('state')
    if(next.manifest) {
      try {checkManifest(next.manifest);context=peerContext(next.manifest,next.ledger);verified=''}
      catch(error) {verified=error.message;context=null}
    }
    state=next
    if($('message').dataset.transient) {$('message').hidden=true;delete $('message').dataset.transient}
    if(checked?.hash!==state.proposal?.body.block.hash) checked=null
    selected=selected.filter(id=>state.pending.some(tx=>tx.id===id))
    render()
  } catch(error) {message('No se pudo consultar tu nodo. Si lo detuviste, los otros siguen intercambiando mensajes. '+error.message);$('message').dataset.transient='true'}
}
function render() {
  if(!state) return
  $('node-title').textContent='Nodo '+state.local.slot+' · '+state.local.name
  $('invitation').value=JSON.stringify(state.invitation)
  $('setup').hidden=Boolean(state.manifest)
  $('network').hidden=!state.manifest
  $('create-network').disabled=!key
  $('load-file').disabled=!key
  if(!state.manifest) return
  const config=state.manifest.config
  const active=Boolean(key && context && !verified),proposing=active && state.proposer===state.local.slot && !state.proposal
  const voted=state.decisions.some(v=>v.body.voter===state.local.slot)
  $('network-label').textContent='ENTRE PARES · '+config.count+' PARTICIPANTES'
  $('identity-name').textContent=state.manifest.name+' · Nodo '+state.local.slot
  $('role').textContent=state.proposer===state.local.slot?'Te toca proponer y comprobar.':'Te toca comprobar y decidir.'
  $('slot').textContent=state.slot
  $('proposer').textContent='Nodo '+state.proposer
  $('quorum').textContent=config.quorum+' de '+config.count+' · hasta '+(config.count-config.quorum)+(config.count-config.quorum===1?' ausencia':' ausencias')
  $('balance').textContent=ether(state.accounts[state.local.slot].balance)+' ETH ficticio'
  $('replica-status').textContent=verified?'La comprobación falló: '+verified:state.ledger.length+' turnos y '+(state.chain.length-1)+' bloques comprobados.'
  $('replica').dataset.verified=String(!verified)
  $('network-hash').textContent='Archivo común: '+state.manifest.hash
  $('head-hash').textContent='Último bloque: '+state.chain.at(-1).hash
  if(shownCount!==config.count) {
    $('to').innerHTML=state.manifest.participants.map(p=>`<option value="${p.slot}">N${p.slot} · ${escape(p.name)}</option>`).join('')
    $('to').value=String(state.local.slot%config.count+1)
    shownCount=config.count
  }
  if(!$('nonce').dataset.dirty) {
    let nonce=state.accounts[state.local.slot].nonce
    while(state.pending.some(tx=>tx.body.from===state.local.slot && tx.body.nonce===nonce)) nonce++
    $('nonce').value=nonce
  }
  $('connected').textContent=state.peers.filter(p=>p.self || p.online).length+' de '+config.count+' con señal'
  $('peers').innerHTML=state.peers.map(p=>`<div class="peer ${p.slot===state.proposer?'proposer':''}"><span class="number">NODO ${p.slot}</span><strong>${escape(p.name)}</strong><span class="small">${p.self?'Mi computadora':p.online?'Comunicación directa':'Sin respuesta reciente'}</span><span class="small">${escape(p.url)}</span></div>`).join('')
  const base=context?nextBaseFee(context.chain.at(-1)):'0'
  $('base').textContent=state.pending.length+' pendientes. Base del próximo bloque: '+gwei(base)+' gwei/gas. Capacidad: 3 transferencias.'
  $('pending').innerHTML=state.pending.length?state.pending.map(tx=>{
    const tip=effectiveTip(tx.body,base)
    return `<tr><td><input type="checkbox" aria-label="Incluir N${tx.body.from} nonce ${tx.body.nonce}" data-transaction="${tx.id}" ${selected.includes(tx.id)?'checked':''} ${proposing?'':'disabled'}></td><td>N${tx.body.from} → N${tx.body.to}</td><td>${tx.body.nonce}</td><td>${tip===null?'No cubre la base':gwei(tip)}</td></tr>`
  }).join(''):'<tr><td colspan="4">Tu cola local está vacía.</td></tr>'
  for(const control of $('send-form').elements) control.disabled=!active
  for(const id of ['suggest','propose','corrupt']) $(id).disabled=!proposing
  $('proposal').dataset.hash=state.proposal?.body.block.hash || ''
  $('proposal').innerHTML=state.proposal?`<p><strong>Propuesta de N${state.proposal.body.block.proposer}</strong><br>${state.proposal.body.block.transactions.length} transferencias · ${state.proposal.body.block.gasUsed} gas<br>Huella: ${escape(short(state.proposal.body.block.hash))}</p>`:'<p>Esperando al proponente. Si no responde, el grupo puede firmar pasar el turno.</p>'
  $('check').disabled=!active || !state.proposal
  $('check-result').textContent=checked?.message || 'Esperando tu comprobación.'
  $('check-result').className='check-result'+(checked?checked.valid?' good':' bad':'')
  $('approve').disabled=!active || voted || !checked?.valid || checked.hash!==state.proposal?.body.block.hash
  $('skip').disabled=!active || voted
  const approvals=state.decisions.filter(v=>v.body.choice!=='skip').length,skips=state.decisions.length-approvals
  $('decisions').textContent=approvals+' aprobaciones y '+skips+' decisiones de pasar. Se necesitan '+config.quorum+' firmas sobre la misma decisión.'
  $('chain').innerHTML=[...state.chain].reverse().map((block,i)=>`<article class="block ${i>0 || !block.height?'final':''}"><strong>${block.height?'Bloque '+block.height:'Génesis'}</strong><code>${escape(short(block.hash))}</code><p>${block.height?'Turno '+block.slot+' · N'+block.proposer+' · '+block.transactions.length+' transferencias':config.count+' identidades · 1 ETH ficticio cada una'}</p><p>${!block.height || i>0?'Finalizado en el modelo':'Certificado. Espera sucesor.'}</p></article>`).join('')
  const supply=Object.values(state.accounts).reduce((sum,a)=>sum+BigInt(a.balance),0n)
  $('supply').textContent='Oferta inicial: '+config.count+' ETH ficticios. Saldos actuales: '+ether(supply)+'. Sin emisión en el modelo.'
  $('ledger').innerHTML=[...state.ledger].reverse().map(r=>`<tr><td>${r.slot}</td><td>${r.choice==='skip'?'Pasar turno':'Bloque '+r.block.height}</td><td>${r.certificate.length}</td><td>${escape(short(r.hash))}</td></tr>`).join('')
  $('events').innerHTML=[...state.events].reverse().map(e=>`<li><span>Turno ${e.slot}</span>${escape(e.detail)}</li>`).join('')
}
await refresh()
setInterval(()=>{if(!busy) refresh()},1500)
