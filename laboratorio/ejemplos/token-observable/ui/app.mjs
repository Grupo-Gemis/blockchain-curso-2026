import {JsonRpcProvider, formatUnits} from 'ethers'
import {TokenSession, serialize, explanation} from './operaciones.mjs'
const $ = id => document.getElementById(id)
const provider = new JsonRpcProvider('http://127.0.0.1:19685', undefined, {cacheTimeout: -1, batchMaxCount: 1})
let session, connected = false, busy = false, sentHash = null
const value = id => Number($(id).value)
function status(message, kind = '') {$('status').textContent = message;$('status').className = kind}
function controls() {
  for (const id of ['actor','receiver','connect']) $(id).disabled = busy
  for (const id of ['create','open','refresh']) $(id).disabled = busy || !connected
  $('operations').disabled = busy || !session?.contract
  $('export').disabled = busy || !session?.records.length
}
function card(account) {
  const el = document.createElement('article');el.className = 'card'
  const title = document.createElement('h3');title.textContent = account.name
  const address = document.createElement('p');address.className = 'address';address.textContent = account.address
  const token = document.createElement('p');token.className = 'metric';token.textContent = account.aulaUnits === null ? 'Sin token' : formatUnits(account.aulaUnits, 18) + ' AULA'
  const eth = document.createElement('p');eth.textContent = account.eth + ' ETH para gas'
  el.append(title,address,token,eth);return el
}
function render(state) {
  $('balances').replaceChildren(...state.accounts.map(card))
  $('supply').textContent = state.totalSupplyUnits === null ? 'La oferta se consultará después de crear el token.' : `Oferta total: ${state.totalSupplyAula} AULA. Entero almacenado: ${state.totalSupplyUnits}. Bloque consultado: ${state.block}.`
  $('allowance').textContent = state.allowances ? `Permiso de Ana para Bruno: ${formatUnits(state.allowances[0][1], 18)} AULA.` : 'Permiso de Ana para Bruno: sin token.'
  $('identity').textContent = state.contract ? 'TokenAula · red 31337 · ' + state.contract : 'Todavía no hay un token seleccionado.'
  const rows = session.records.map(entry => {
    const tr = document.createElement('tr')
    const result = entry.kind === 'simulation' ? (entry.accepted ? 'Estimación aceptada, sin envío' : 'Estimación rechazada, sin envío') : entry.status === 1 ? 'Incluida, exitosa' : 'Incluida, revertida'
    for (const text of [`${entry.operation} · ${entry.actor}`,result,entry.gasUsed ?? 'No se cobró',entry.feeETH ?? '0']) {const td=document.createElement('td');td.textContent=text;tr.append(td)}
    return tr
  })
  $('history').replaceChildren(...rows)
  $('detail').textContent = session.records.length ? serialize(session.records.at(-1)) : 'Sin observaciones.'
}
async function run(action) {
  if (busy) return
  busy = true;sentHash = null;controls();status('Comprobando y ejecutando la solicitud…')
  try {
    const result = await action()
    render(result?.after ?? await session.snapshot())
    if (result?.kind === 'simulation') status(result.message + ' Esta consulta no publicó una transacción ni cobró gas.', result.accepted ? 'success' : 'error')
    else if (result?.status === 0) status(`La transacción se incluyó y revirtió. Los cambios de tokens se deshicieron. Quien llamó pagó ${result.feeETH} ETH de gas y consumió un nonce. Hash: ${result.hash}`, 'error')
    else if (result?.hash) status(`Operación incluida con éxito. Pagó ${result.feeETH} ETH de gas. Hash: ${result.hash}`, 'success')
    else status('Datos del nodo local comprobados y actualizados.', 'success')
  } catch (error) {
    const note = sentHash ? ` Hay un hash enviado: ${sentHash}. Comprobá su recibo antes de repetir.` : ' No se obtuvo un recibo de inclusión. Revisá el estado antes de repetir un envío.'
    status(explanation(error, session?.contract) + note, 'error')
  } finally {busy = false;controls()}
}
$('connect').onclick = () => run(async () => {
  if (connected) return {after:await session.snapshot()}
  const artifact = await fetch('/artefacto.json').then(r => {if(!r.ok)throw Error('Falta compilar el contrato.');return r.json()})
  const candidate = new TokenSession(provider, artifact, hash => {sentHash=hash;status('Enviada. Esperando el recibo: ' + hash)})
  const state = await candidate.connect()
  session = candidate;connected = true;return {after:state}
})
$('create').onclick = () => run(() => session.create(value('actor'), value('receiver')))
$('open').onclick = () => run(async () => ({after:await session.open($('address').value.trim())}))
$('refresh').onclick = () => run(async () => ({after:await session.snapshot()}))
$('transfer').onclick = () => run(() => session.transfer(value('actor'), value('target'), $('transferAmount').value))
$('approve').onclick = () => run(() => session.approve(value('actor'), value('spender'), $('approvalAmount').value))
$('revoke').onclick = () => run(() => session.approve(value('actor'), value('spender'), '0'))
$('spend').onclick = () => run(() => session.transferFrom(value('actor'), value('owner'), value('delegatedTarget'), $('delegatedAmount').value))
$('simulate').onclick = () => run(() => session.simulate(value('actor'), value('owner'), value('delegatedTarget'), $('delegatedAmount').value))
$('force').onclick = () => run(() => session.transferFrom(value('actor'), value('owner'), value('delegatedTarget'), $('delegatedAmount').value, true))
$('export').onclick = () => {
  const url = URL.createObjectURL(new Blob([serialize(session.report())], {type:'application/json'}))
  const a = document.createElement('a');a.href=url;a.download='token-observable.json';a.click();URL.revokeObjectURL(url)
}
controls()
