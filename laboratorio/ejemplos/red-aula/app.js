import {eth, GAS_TX, copy, hash, sign, blockBody, buildBlock, checkBlock,
  replay, effectiveTip, nextBaseFee, selectByTip} from './modelo.mjs'

const $ = id => document.getElementById(id)
const escape = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')
const short = value => value ? value.slice(0,10) + '…' + value.slice(-6) : '—'
const gwei = value => Number(eth.formatUnits(value,9)).toLocaleString('es-AR', {maximumFractionDigits:5})
const ether = value => Number(eth.formatEther(value)).toLocaleString('es-AR', {maximumFractionDigits:8})
let identity = JSON.parse(sessionStorage.getItem('aula-identidad') || 'null')
let wallet = identity ? new eth.Wallet(identity.privateKey) : null
let teacherKey = new URLSearchParams(location.hash.slice(1)).get('docente') || sessionStorage.getItem('aula-docente')
if (teacherKey) {sessionStorage.setItem('aula-docente',teacherKey); history.replaceState(null,'',location.pathname)}
let state, localChain = [], localAccounts, selected = [], checked = null, offline = false, busy = false, replicaError = ''
const saveIdentity = () => sessionStorage.setItem('aula-identidad',JSON.stringify(identity))
function message(text) {$('message').textContent = text; $('message').hidden = false}
async function api(route, value) {
  const response = await fetch('/api/' + route, {method:value ? 'POST' : 'GET', headers:{
    'Content-Type':'application/json', ...(identity ? {'x-participant-token':identity.token} : {}),
    ...(teacherKey ? {'x-teacher-key':teacherKey} : {})}, ...(value ? {body:JSON.stringify(value)} : {})})
  const data = await response.json()
  if (!response.ok) throw Error(data.error || 'La solicitud no pudo completarse.')
  return data
}
async function act(action) {
  if (busy) return
  busy = true
  try {await action(); $('message').hidden = true; await refresh()}
  catch(error) {message(error.message)}
  finally {busy = false}
}
let shownCount
function rosterOptions() {
  if (shownCount === state.count) return
  shownCount = state.count
  const options = Array.from({length:state.count},(_,i) => `<option value="${i+1}">Nodo ${i+1}</option>`).join('')
  $('slot').innerHTML = options
  $('to').innerHTML = options
  $('count').value = state.count
}
$('teacher-panel').hidden = !teacherKey
$('nonce').addEventListener('input', () => {$('nonce').dataset.dirty = 'true'})
$('join-form').addEventListener('submit', event => {event.preventDefault(); act(async () => {
  if (!state) throw Error('Esperá la conexión con el aula.')
  wallet = eth.Wallet.createRandom()
  const payload = {sessionId:state.sessionId, slot:Number($('slot').value), name:$('name').value.trim()}
  const joined = await api('join', {...payload,pin:$('pin').value,address:wallet.address,signature:await sign(wallet,payload)})
  identity = {...joined,privateKey:wallet.privateKey,name:payload.name}
  saveIdentity()
  $('to').value = String(identity.slot % state.count + 1)
})})
$('configure').onclick = () => act(() => api('teacher',{action:'configure',count:Number($('count').value)}))
$('start').onclick = () => act(() => api('teacher',{action:'start'}))
$('next').onclick = () => act(() => api('teacher',{action:'next'}))
$('offline').onclick = () => {offline = !offline; $('offline').textContent = offline ? 'Reconectar y verificar la cadena' : 'Desconectar mi nodo'; render(); if (!offline) refresh()}
$('tx-form').addEventListener('submit', event => {event.preventDefault(); act(async () => {
  if (!identity || offline) throw Error('Conectá tu nodo antes de firmar.')
  const body = {chainId:state.chainId,from:identity.slot,to:Number($('to').value),nonce:Number($('nonce').value),
    value:eth.parseEther($('value').value).toString(),gasLimit:GAS_TX,
    maxFeePerGas:eth.parseUnits($('max').value,9).toString(),maxPriorityFeePerGas:eth.parseUnits($('tip').value,9).toString()}
  const transaction = {body,signature:await sign(wallet,body)}
  transaction.id = hash(transaction)
  await api('transaction',{transaction})
  delete $('nonce').dataset.dirty
})})
function context() {
  if (!localChain.length || replicaError) throw Error('Primero se necesita una copia local verificada de la cadena.')
  if (state.phase === 'certified' && localChain.at(-1).hash === state.proposal?.hash) {
    const prefix = localChain.slice(0,-1)
    return {parent:prefix.at(-1),accounts:replay(prefix,state.participants,state.seed,state.config),slot:state.slot,seed:state.seed,participants:state.participants,config:state.config}
  }
  return {parent:localChain.at(-1),accounts:localAccounts,slot:state.slot,seed:state.seed,participants:state.participants,config:state.config}
}
$('pending').addEventListener('change', event => {
  const id = event.target.dataset.transaction
  if (!id) return
  selected = event.target.checked ? [...selected.filter(v => v !== id),id] : selected.filter(v => v !== id)
  $('selection').textContent = selected.length ? 'Orden elegido: ' + selected.map(id => {const t=state.pending.find(t => t.id === id);return t ? `N${t.body.from}, nonce ${t.body.nonce}` : ''}).join(' → ') : 'Sin selección. Se puede proponer un bloque vacío.'
})
$('suggest').onclick = () => act(async () => {selected = selectByTip(state.pending,context()).map(t => t.id)})
$('propose').onclick = () => act(async () => {
  const transactions = selected.map(id => state.pending.find(t => t.id === id)).filter(Boolean)
  const block = buildBlock({...context(),transactions})
  if ($('corrupt').checked) {block.stateRoot = '0x' + '0'.repeat(64); block.hash = hash(blockBody(block))}
  block.signature = await sign(wallet,{hash:block.hash})
  await api('propose',{block})
  checked = null
})
$('check').onclick = () => {
  try {
    checkBlock(state.proposal,context())
    checked = {hash:state.proposal.hash,ok:true,message:'La ejecución independiente coincide. Firma, enlace, gas, nonces, saldos y estado son válidos.'}
  } catch(error) {checked = {hash:state.proposal?.hash,ok:false,message:'Rechazar: ' + error.message}}
  render()
}
async function vote(approve) {
  if (!identity || offline) throw Error('Conectá tu identidad para votar.')
  if (approve && (!checked?.ok || checked.hash !== state.proposal?.hash)) throw Error('Comprobá esta propuesta antes de aprobarla.')
  const payload = {slot:state.slot,blockHash:state.proposal.hash,approve,voter:identity.slot}
  await api('vote',{vote:{voter:identity.slot,approve,signature:await sign(wallet,payload)}})
}
$('approve').onclick = () => act(() => vote(true))
$('reject').onclick = () => act(() => vote(false))
$('export').onclick = () => {
  const data = {...copy(state),localReplica:{chain:copy(localChain),stateRoot:localAccounts ? hash(localAccounts) : null,verified:!replicaError},exportedBy:identity?.slot,offline}
  const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'})
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'evidencia-aula-' + state.sessionId + '-nodo-' + (identity?.slot || 'observador') + '.json'
  link.click()
  setTimeout(() => URL.revokeObjectURL(link.href),1000)
}
async function refresh() {
  if (offline) return
  try {
    const next = await api('state')
    if (identity && identity.sessionId !== next.sessionId) {
      identity = null; wallet = null; sessionStorage.removeItem('aula-identidad')
      message('Comenzó otra sesión de aula. La evidencia anterior permanece en la carpeta del docente. Ingresá otra vez.')
    }
    state = next
    if (state.chain.length && hash(localChain) !== hash(state.chain)) {
      try {
        const accounts = replay(state.chain,state.participants,state.seed,state.config)
        localChain = copy(state.chain)
        localAccounts = accounts
        replicaError = ''
        sessionStorage.setItem('aula-cadena-' + state.sessionId,JSON.stringify(localChain))
      } catch(error) {replicaError = error.message}
    }
    if (checked?.hash !== state.proposal?.hash) checked = null
    selected = selected.filter(id => state.pending.some(t => t.id === id))
    render()
  } catch(error) {message('No se pudo actualizar la red: ' + error.message)}
}
function render() {
  if (!state) return
  rosterOptions()
  $('network-label').textContent = 'RED COORDINADA · ' + state.count + ' PARTICIPANTES'
  $('network-description').textContent = 'Cada participante firma, comprueba las propuestas y conserva una copia verificable. Se necesitan ' + state.quorum + ' aprobaciones distintas de ' + state.count + '.'
  $('teacher-help').textContent = 'Elegí la cantidad antes del primer ingreso. Para comenzar deben estar las ' + state.count + ' identidades. Cada ciclo de ' + state.count + ' turnos asigna una propuesta a cada estudiante.'
  $('count').disabled = state.participants.length > 0 || state.phase !== 'waiting'
  $('configure').disabled = $('count').disabled
  $('start').textContent = 'Iniciar red con ' + state.count + ' nodos'
  $('finality-help').textContent = 'En este modelo, ' + state.quorum + ' firmas certifican un bloque. Su sucesor certificado marca al anterior como finalizado. Ethereum usa reglas adicionales con checkpoints de épocas.'
  const active = Boolean(identity && !offline && !replicaError)
  const proposing = active && state.phase === 'open' && state.proposer === identity.slot
  const voting = active && ['voting','certified'].includes(state.phase) && !state.votes.some(v => v.voter === identity.slot)
  $('join-panel').hidden = Boolean(identity) || Boolean(teacherKey)
  $('identity-panel').hidden = !identity
  $('identity-name').textContent = identity ? `Nodo ${identity.slot} · ${identity.name}` : ''
  $('role').textContent = offline ? 'Desconectado. Conservás tu última copia.' : state.phase === 'waiting' ? 'Esperando el bloque génesis' : state.proposer === identity?.slot ? 'Te toca proponer. También podés atestiguar.' : 'Te toca comprobar y atestiguar.'
  const labels = {waiting:'Esperando identidades',open:'Seleccionar transacciones',voting:'Comprobar y votar',certified:'Bloque certificado'}
  $('phase').textContent = (state.slot ? state.slot + ' · ' : '') + labels[state.phase]
  $('proposer').textContent = state.proposer ? 'Nodo ' + state.proposer : 'Sin asignar'
  const base = state.chain.length ? nextBaseFee(state.chain.at(-1)) : '20000000000'
  $('base').textContent = gwei(base) + ' gwei/gas'
  $('capacity').textContent = state.pending.length + ' pendientes / 3 transferencias'
  $('joined').textContent = state.participants.length + ' de ' + state.count
  $('start').disabled = state.phase !== 'waiting' || state.participants.length !== state.count
  $('next').disabled = state.phase === 'waiting'
  $('peers').innerHTML = Array.from({length:state.count},(_,i) => {
    const id=i+1,p=state.participants.find(p => p.slot === id),vote=state.votes.find(v => v.voter === id)
    return `<div class="peer ${state.proposer === id ? 'proposer' : ''} ${vote ? vote.approve ? 'approved' : 'rejected' : ''}"><span class="number">NODO ${id}</span><strong>${escape(p?.name || 'Sin ingresar')}</strong><span class="small">${state.proposer === id ? 'Proponente y validador' : 'Validador'} · ${p ? p.online ? 'conectado' : 'sin señal reciente' : 'pendiente'}</span><span class="small">${vote ? vote.approve ? 'Aprobó con firma' : 'Rechazó con firma' : 'Sin voto en este turno'}</span></div>`
  }).join('')
  $('replica-status').textContent = replicaError ? 'La comprobación local falló: ' + replicaError : localChain.length ? `${offline ? 'Sin conexión. ' : ''}${localChain.length - 1} bloques comprobados desde génesis. Huella de mi último bloque:` : 'La verificación local empieza al crear el bloque génesis.'
  $('replica-hash').textContent = localChain.at(-1)?.hash || ''
  $('replica').dataset.verified = String(Boolean(localChain.length && !replicaError))
  const account = localAccounts?.[identity?.slot] || state.accounts?.[identity?.slot]
  if (account) {
    $('balance').textContent = `Mi saldo: ${ether(account.balance)} ETH ficticio. Próximo nonce ejecutable: ${account.nonce}.`
    if (!$('nonce').dataset.dirty) {
      let nonce = account.nonce
      while (state.pending.some(t => t.body.from === identity.slot && t.body.nonce === nonce)) nonce++
      $('nonce').value = nonce
    }
  }
  for (const control of $('tx-form').elements) control.disabled = !active || state.phase === 'waiting' || state.phase === 'voting'
  $('pending').innerHTML = state.pending.length ? state.pending.map(tx => {
    const tip = effectiveTip(tx.body,base), from = tx.body.from, expected = state.accounts[from].nonce
    const condition = tip === null ? 'Base mayor al máximo' : tx.body.nonce > expected ? 'Espera nonce anterior' : 'Candidata'
    return `<tr><td><input type="checkbox" aria-label="Incluir nodo ${from} nonce ${tx.body.nonce}" data-transaction="${tx.id}" ${selected.includes(tx.id) ? 'checked' : ''} ${proposing ? '' : 'disabled'}></td><td>N${from} → N${tx.body.to}</td><td>${tx.body.nonce}</td><td>${gwei(tx.body.maxFeePerGas)}</td><td>${tip === null ? '—' : gwei(tip)}</td><td>${condition}</td></tr>`
  }).join('') : '<tr><td colspan="6">La cola está vacía. Cada estudiante puede firmar una operación.</td></tr>'
  $('selection').textContent = selected.length ? 'Orden elegido: ' + selected.map(id => {const t=state.pending.find(t => t.id === id);return `N${t.body.from}, nonce ${t.body.nonce}`}).join(' → ') : 'Sin selección. Se puede proponer un bloque vacío.'
  for (const id of ['suggest','propose','corrupt']) $(id).disabled = !proposing
  $('check').disabled = !active || !state.proposal || !['voting','certified'].includes(state.phase)
  $('approve').disabled = !voting || !checked?.ok || checked.hash !== state.proposal?.hash
  $('reject').disabled = !voting
  const proposal = state.proposal
  $('proposal').innerHTML = proposal ? `<p><strong>Bloque ${proposal.height}</strong> · Nodo ${proposal.proposer}<br>${proposal.transactions.length} transferencias · ${proposal.gasUsed.toLocaleString('es-AR')} gas<br>Quema declarada: ${ether(proposal.burned)} ETH<br>Propinas declaradas: ${ether(proposal.tips)} ETH</p><p class="small">Huella: ${short(proposal.hash)}</p>` : '<p>Todavía no hay una propuesta para este turno.</p>'
  $('check-result').textContent = checked?.message || 'Esperando tu comprobación independiente.'
  $('check-result').className = 'check-result' + (checked ? checked.ok ? ' good' : ' bad' : '')
  $('votes').textContent = `${state.votes.filter(v => v.approve).length} de ${state.quorum} aprobaciones necesarias. ${state.votes.filter(v => !v.approve).length} rechazos.`
  $('finalized').textContent = state.finalizedHeight ? 'Finalizado hasta bloque ' + state.finalizedHeight : 'Solo génesis finalizado'
  $('chain').innerHTML = [...localChain].reverse().map(block => `<article class="block ${block.height <= state.finalizedHeight ? 'final' : ''}"><strong>${block.height ? 'Bloque ' + block.height : 'Génesis'}</strong><p>${block.height ? 'Turno ' + block.slot + ' · propuso N' + block.proposer : state.count + ' identidades · 1 ETH ficticio cada una'}</p><code>${escape(short(block.hash))}</code><p>${block.height ? block.transactions.length + ' transferencias · ' + block.certificate.length + ' firmas' : 'Estado inicial compartido'}</p><p>${block.height <= state.finalizedHeight ? 'Finalizado en este modelo' : 'Certificado. Espera un sucesor certificado.'}</p></article>`).join('')
  if (localAccounts) {
    const supply = Object.values(localAccounts).reduce((sum,a) => sum + BigInt(a.balance),0n)
    const burned = localChain.slice(1).reduce((sum,b) => sum + BigInt(b.burned),0n)
    $('supply').textContent = `Oferta inicial: ${state.count} ETH ficticios. Saldos actuales: ${ether(supply)}. Quema acumulada: ${ether(burned)}. Las propinas cambian de cuenta. Esta simulación no emite recompensas de consenso.`
  }
  $('events').innerHTML = [...state.events].reverse().slice(0,40).map(event => `<li><span>Turno ${event.slot}</span>${escape(event.detail)}</li>`).join('')
}
await refresh()
setInterval(() => {if (!busy) refresh()},1200)
