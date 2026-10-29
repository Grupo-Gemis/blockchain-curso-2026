import {readFile} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import path from 'node:path'
import {stable,hash} from './modelo.mjs'
import {checkManifest,peerContext} from './pares.mjs'
import {requestTimeout} from './conectividad.mjs'

// Solo consulta datos públicos. No registra nodos ni firma decisiones.
export async function diagnose(manifest, {timeout, fetcher = fetch} = {}) {
  checkManifest(manifest)
  const wait = requestTimeout(timeout)
  const rows = await Promise.all(manifest.participants.map(async participant => {
    const row = {slot:participant.slot,name:participant.name,url:participant.url}
    try {
      const response = await fetcher(participant.url + '/api/state', {signal:AbortSignal.timeout(wait),headers:{'Cache-Control':'no-cache'}})
      if (!response.ok) return {...row,status:'sin_respuesta',detail:'HTTP ' + response.status}
      const state = await response.json()
      if (state.networkId !== manifest.hash || state.manifest?.hash !== manifest.hash) return {...row,status:'otra_red',detail:'No tiene cargado el mismo red.json.'}
      checkManifest(state.manifest)
      if (stable(state.invitation) !== stable(participant) || state.local?.slot !== participant.slot || state.local?.address !== participant.address) return {...row,status:'otra_identidad',detail:'La dirección responde con otra identidad de nodo.'}
      let verified
      try { verified = peerContext(manifest,state.ledger) }
      catch { return {...row,status:'historial_invalido',detail:'El historial recibido no supera la comprobación de certificados y ejecución.'} }
      if (hash(verified.accounts) !== hash(state.accounts) || stable(verified.chain) !== stable(state.chain)) return {...row,status:'historial_invalido',detail:'Los saldos o la cadena anunciados no coinciden con el historial verificado.'}
      return {...row,status:'correcto',height:verified.chain.at(-1).height,head:verified.chain.at(-1).hash,rounds:state.ledger.length}
    } catch {
      return {...row,status:'sin_respuesta',detail:'No se pudo consultar o interpretar la respuesta. Revisá VPN, dirección, puerto, permisos del sistema y tiempo de espera.'}
    }
  }))
  const reachable = rows.every(row => row.status === 'correcto')
  const sameHead = reachable && new Set(rows.map(row => row.head)).size === 1
  const sameRound = reachable && new Set(rows.map(row => row.rounds)).size === 1
  return {networkId:manifest.hash,participants:manifest.config.count,quorum:manifest.config.quorum,reachable,sameHead,sameRound,
    ready:reachable && sameHead && sameRound,rows}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arg = (name,fallback) => {const i=process.argv.indexOf(name);return i<0?fallback:process.argv[i+1]}
  const file = arg('--red','red.json')
  const rawWait = arg('--espera-ms',undefined)
  try {
    const result = await diagnose(JSON.parse(await readFile(file,'utf8')), {timeout:rawWait===undefined?undefined:Number(rawWait)})
    console.table(result.rows.map(row => ({nodo:row.slot,nombre:row.name,direccion:row.url,estado:row.status,bloques:row.height ?? '—',detalle:row.detail || row.head})))
    console.log('Quórum: ' + result.quorum + ' de ' + result.participants + '.')
    console.log(result.ready ? 'Todos responden con identidades, historial y último bloque coincidentes desde esta computadora.' : result.reachable ? 'Todos tienen un historial válido. Esperen la sincronización y comparen otra vez sin proponer mientras tanto.' : 'Hay nodos sin comprobar. Revisen los detalles antes de comenzar.')
    console.log('Cada estudiante debe repetir esta consulta desde su casa. Esta comprobación no firma ni cambia la red.')
    if (!result.ready) process.exitCode = 1
  } catch (error) {
    console.error(error.code==='ENOENT'?'No se encontró el archivo de red. Usá --red con la ruta al red.json compartido.':error.message)
    process.exitCode = 1
  }
}
