// Ensayo de clientes reales en una sola computadora. No demuestra conectividad entre casas.
import assert from 'node:assert/strict'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { createIdentity, configure } from './preparar.mjs'
import { makeNetwork, compose, json } from './configuracion.mjs'
import { context, send, feeBreakdown, status, compare } from './operar.mjs'

const root = path.resolve('resultados', `besu-real-${Date.now()}`)
await mkdir(root, {recursive: true, mode: 0o700})
const composePath = path.join(root, 'compose.yaml')
const dirs = Array.from({length: 4}, (_, i) => path.join(root, `nodo-${i + 1}`))
function docker(...args) {
  return new Promise((resolve, reject) => {
    const child = spawn('docker', args, {stdio: ['ignore', 'pipe', 'pipe']})
    let output = ''
    child.stdout.on('data', chunk => { output += chunk })
    child.stderr.on('data', chunk => { output += chunk })
    child.on('error', reject)
    child.on('close', code => code === 0 ? resolve(output) : reject(new Error(output.slice(-12000))))
  })
}
const composeCommand = (...args) => docker('compose', '-f', composePath, ...args)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
async function until(description, action, timeout = 180000) {
  const end = Date.now() + timeout
  let last
  while (Date.now() < end) {
    try { const value = await action(); if (value) return value } catch (error) { last = error.message }
    await delay(2000)
  }
  throw new Error(`Tiempo agotado: ${description}. ${last ?? ''}`)
}
let started = false
try {
  console.log('Comprobando Docker. La prueba ejecuta cuatro Besu y necesita al menos 8 GB disponibles para Docker.')
  await docker('info', '--format', '{{.ServerVersion}}')
  const invitations = await Promise.all(dirs.map((dir, i) => createIdentity(dir, {
    id: i + 1, name: `Prueba ${i + 1}`, host: `172.29.237.${i + 11}`, rpcPort: 18545 + i
  })))
  const network = makeNetwork(invitations, {title: 'Prueba automatizada de cuatro clientes Besu', blockSeconds: 2, chainId: 20269991})
  await Promise.all(dirs.map(dir => configure(dir, network)))
  const whole = {name: `utn-besu-prueba-${Date.now()}`, services: {}, volumes: {}, networks: {aula: {ipam: {config: [{subnet: '172.29.237.0/24'}]}}}}
  for (const p of invitations) {
    const service = compose(network, p).services.besu
    service.ports = [`127.0.0.1:${p.rpcPort}:8545/tcp`]
    service.volumes = service.volumes.map(v => v.startsWith('./') ? `./nodo-${p.id}/` + v.slice(2) : `cadena${p.id}:/var/lib/besu`)
    service.networks = {aula: {ipv4_address: p.host}}
    service.mem_limit = '2g'
    service.environment.JAVA_OPTS = '-Xms256m -Xmx768m'
    whole.services[`nodo${p.id}`] = service
    whole.volumes[`cadena${p.id}`] = {}
  }
  await writeFile(composePath, json(whole))
  await composeCommand('config', '--quiet')
  console.log('Iniciando cuatro clientes reales con la misma configuración de génesis.')
  started = true
  await composeCommand('up', '-d')
  const contexts = await Promise.all(dirs.map(dir => until('inicio y comprobación de identidad', () => context(dir))))
  const height = async i => Number(BigInt(await contexts[i].rpc('eth_blockNumber')))
  await until('primeros bloques', async () => (await height(0)) >= 8)
  const tx = await send(contexts[0], dirs[0], {toId: 2, priority: '2', maximum: '100'})
  const receipt = await until('recibo de transferencia', () => contexts[0].rpc('eth_getTransactionReceipt', [tx.hash]))
  const fees = feeBreakdown(receipt, await contexts[0].rpc('eth_getBlockByHash', [receipt.blockHash, false]))
  assert.equal(fees.status, 1)
  assert.equal(fees.gasUsed, '21000')
  console.log('Transferencia incluida. Deteniendo el nodo que reunió las invitaciones.')
  await composeCommand('stop', 'nodo1')
  const beforeOneOff = await height(1)
  await until('avance con tres de cuatro', async () => (await height(1)) >= beforeOneOff + 2)
  console.log('Tres nodos avanzan. Deteniendo otro para comprobar la falta de quórum.')
  await composeCommand('stop', 'nodo2')
  await delay(8000)
  const stalledAt = await height(2)
  await delay(12000)
  assert.equal(await height(2), stalledAt, 'Dos de cuatro no deben producir nuevos bloques.')
  console.log('La cadena se detuvo. Reiniciando con las mismas claves y volúmenes.')
  await composeCommand('start', 'nodo1', 'nodo2')
  await until('recuperación del consenso', async () => (await height(2)) >= stalledAt + 2, 240000)
  const commonHeight = Math.min(...await Promise.all(contexts.map((_, i) => height(i)))) - 1
  const reports = await Promise.all(contexts.map(ctx => status(ctx, commonHeight)))
  const compared = compare(reports)
  assert.ok(compared.sameBlockAndState && compared.distinctNodes)
  for (let i = 0; i < reports.length; i++) await writeFile(path.join(root, `evidencia-${i + 1}.json`), json(reports[i]))
  const stats = await composeCommand('stats', '--no-stream', '--format', 'json')
  await writeFile(path.join(root, 'resultado.json'), json({passed: true, scope: 'Cuatro clientes reales en un host. No verifica equipos de 8 GB ni enlaces entre casas.', fees, compared, stats}))
  console.log(`Prueba aprobada. Evidencia en ${root}`)
} catch (error) {
  await writeFile(path.join(root, 'resultado.json'), json({passed: false, error: error.message}))
  console.error(error.message)
  process.exitCode = 1
} finally {
  if (started) {
    try {
      await writeFile(path.join(root, 'contenedores.log'), await composeCommand('logs', '--no-color'))
      await composeCommand('down')
    } catch (error) { console.error(`Revisar los contenedores de ${composePath}: ${error.message}`); process.exitCode = 1 }
  }
}
