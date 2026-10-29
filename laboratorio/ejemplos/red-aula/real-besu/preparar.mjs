import { mkdir, readFile, writeFile, readdir, chmod } from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { pathToFileURL } from 'node:url'
import ethers from '../vendor/ethers.umd.cjs'
import { invitation, checkInvitation, makeNetwork, checkNetwork, genesis, compose, enode, digest, json } from './configuracion.mjs'

export async function createIdentity(directory, options) {
  // Crear una carpeta nueva evita reemplazar claves o una cadena existente.
  const node = ethers.Wallet.createRandom()
  const wallet = ethers.Wallet.createRandom()
  const pub = await invitation(options, node, wallet)
  await mkdir(directory, {mode: 0o700})
  await writeFile(path.join(directory, 'clave-nodo'), node.privateKey.slice(2) + '\n', {mode: 0o644, flag: 'wx'})
  await writeFile(path.join(directory, 'wallet-privada.json'), json({address: wallet.address.toLowerCase(), privateKey: wallet.privateKey}), {mode: 0o600, flag: 'wx'})
  await writeFile(path.join(directory, 'invitacion.json'), json(pub), {flag: 'wx'})
  await writeFile(path.join(directory, '.gitignore'), '*\n!.gitignore\n', {flag: 'wx'})
  return pub
}
export async function configure(directory, network) {
  const n = checkNetwork(network)
  const own = checkInvitation(JSON.parse(await readFile(path.join(directory, 'invitacion.json'), 'utf8')))
  const p = n.participants.find(p => p.id === own.id)
  if (!p || json(p) !== json(own)) throw new Error('Tu invitación no figura intacta en el archivo común.')
  const node = new ethers.Wallet('0x' + (await readFile(path.join(directory, 'clave-nodo'), 'utf8')).trim())
  const wallet = JSON.parse(await readFile(path.join(directory, 'wallet-privada.json'), 'utf8'))
  if (node.address.toLowerCase() !== p.validator || new ethers.Wallet(wallet.privateKey).address.toLowerCase() !== p.wallet) throw new Error('Las claves locales no corresponden a la invitación.')
  const g = genesis(n)
  const files = {'red-besu.json': json(n), 'genesis.json': json(g),
    'static-nodes.json': json(n.participants.filter(x => x.id !== p.id).map(enode)),
    'compose.yaml': json(compose(n, p)),
    'configurado.json': json({fingerprint: n.fingerprint, genesisFileSHA256: digest(g), id: p.id, rpc: `http://127.0.0.1:${p.rpcPort}`})}
  // Se comprueba todo antes de escribir. Una configuración de otra red se conserva.
  for (const [file, content] of Object.entries(files)) {
    try {
      if (await readFile(path.join(directory, file), 'utf8') !== content) throw new Error(`Ya existe ${file} con otro contenido. Usar una carpeta nueva, sin borrar la anterior.`)
    } catch (error) { if (error.code !== 'ENOENT') throw error }
  }
  for (const [file, content] of Object.entries(files)) await writeFile(path.join(directory, file), content)
  await chmod(path.join(directory, 'clave-nodo'), 0o644)
  return {participant: p, genesisFileSHA256: digest(g), fingerprint: n.fingerprint}
}
export async function collect(directory, options, destination) {
  const names = (await readdir(directory)).filter(name => name.endsWith('.json')).sort()
  const invitations = await Promise.all(names.map(async name => JSON.parse(await readFile(path.join(directory, name), 'utf8'))))
  const network = makeNetwork(invitations, options)
  await writeFile(destination, json(network), {flag: 'wx'})
  return network
}
async function main() {
  const {values: v, positionals: [command]} = parseArgs({allowPositionals: true, options: {
    id: {type: 'string'}, nombre: {type: 'string'}, ip: {type: 'string'}, p2p: {type: 'string', default: '30303'},
    rpc: {type: 'string', default: '8545'}, datos: {type: 'string'}, invitaciones: {type: 'string'},
    red: {type: 'string', default: 'red-besu.json'}, titulo: {type: 'string'}, 'chain-id': {type: 'string'},
    segundos: {type: 'string'}, 'gas-limite': {type: 'string'}
  }})
  if (command === 'identidad') {
    if (!v.id || !v.nombre || !v.ip || !v.datos) throw new Error('Usar identidad --id 1 --nombre Ana --ip IP_VPN --datos datos-besu-1')
    const pub = await createIdentity(v.datos, {id: v.id, name: v.nombre, host: v.ip, p2pPort: v.p2p, rpcPort: v.rpc})
    console.log(`Identidad ${pub.id}: ${pub.name}. Compartir únicamente ${v.datos}/invitacion.json`)
  } else if (command === 'red') {
    if (!v.invitaciones) throw new Error('Indicar --invitaciones CARPETA con los archivos públicos.')
    const n = await collect(v.invitaciones, {title: v.titulo, chainId: v['chain-id'], blockSeconds: v.segundos, gasLimit: v['gas-limite']}, v.red)
    console.log(`${n.participants.length} validadores. Huella del archivo común: ${n.fingerprint}`)
    console.log(`Compartir ${v.red}. No se generaron ni reunieron claves privadas de estudiantes.`)
  } else if (command === 'configurar') {
    if (!v.datos) throw new Error('Indicar --datos datos-besu-1.')
    console.log(await configure(v.datos, JSON.parse(await readFile(v.red, 'utf8'))))
    console.log(`Preparado. Iniciar con: docker compose -f ${path.join(v.datos, 'compose.yaml')} up -d`)
  } else throw new Error('Elegir identidad, red o configurar. Consultar real-besu/README.md.')
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch(error => { console.error(error.message); process.exitCode = 1 })
