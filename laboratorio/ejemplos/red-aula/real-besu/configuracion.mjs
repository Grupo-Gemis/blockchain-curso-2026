import { createHash } from 'node:crypto'
import ethers from '../vendor/ethers.umd.cjs'

export const IMAGE = 'hyperledger/besu:26.10.2'
export const FORMAT = 'utn-besu-qbft/v1'
export const ZERO = '0x' + '00'.repeat(32)
export const MIX = '0x63746963616c2062797a616e74696e65206661756c7420746f6c6572616e6365'
export const json = value => JSON.stringify(value, null, 2) + '\n'
export const digest = value => createHash('sha256').update(json(value)).digest('hex')
const need = (condition, message) => { if (!condition) throw new Error(message) }
export function integer(value, min, max, label) {
  const n = Number(value)
  need(Number.isSafeInteger(n) && n >= min && n <= max, `${label}: usar un entero entre ${min} y ${max}.`)
  return n
}
export function privateIPv4(host) {
  need(typeof host === 'string' && /^(\d{1,3}\.){3}\d{1,3}$/.test(host), 'Indicar una dirección IPv4 de la VPN o de la red local.')
  const [a, b, c, d] = host.split('.').map(Number)
  need([a, b, c, d].every(x => x <= 255), 'Dirección IPv4 inválida.')
  need(a === 10 || (a === 100 && b >= 64 && b <= 127) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168), 'Usar la dirección privada de la VPN o de la LAN, alcanzable por los compañeros.')
  return host
}
function invitationBody(value) {
  need(value && typeof value === 'object', 'Falta una invitación.')
  need(value.kind === FORMAT && value.version === 1, 'Formato de invitación incompatible.')
  const id = integer(value.id, 1, 60, 'Número de estudiante')
  need(typeof value.name === 'string' && value.name.trim() === value.name && value.name.length >= 1 && value.name.length <= 80, 'Nombre inválido.')
  const host = privateIPv4(value.host)
  const p2pPort = integer(value.p2pPort, 1024, 65535, 'Puerto P2P')
  const rpcPort = integer(value.rpcPort, 1024, 65535, 'Puerto RPC local')
  need(/^[a-f0-9]{128}$/.test(value.publicKey), 'Clave pública de nodo inválida.')
  const validator = ethers.computeAddress('0x04' + value.publicKey).toLowerCase()
  need(validator === value.validator, 'La dirección del validador no corresponde a su clave pública.')
  const wallet = ethers.getAddress(value.wallet).toLowerCase()
  need(wallet === value.wallet && wallet !== validator, 'La wallet de operaciones debe ser distinta de la clave de consenso.')
  return {kind: FORMAT, version: 1, id, name: value.name, host, p2pPort, rpcPort, publicKey: value.publicKey, validator, wallet}
}
export async function invitation({id, name, host, p2pPort = 30303, rpcPort = 8545}, node, wallet) {
  const body = invitationBody({kind: FORMAT, version: 1, id: Number(id), name: name.trim(), host,
    p2pPort: Number(p2pPort), rpcPort: Number(rpcPort), publicKey: node.signingKey.publicKey.slice(4).toLowerCase(),
    validator: node.address.toLowerCase(), wallet: wallet.address.toLowerCase()})
  const message = FORMAT + '\n' + json(body)
  return {...body, nodeSignature: await node.signMessage(message), walletSignature: await wallet.signMessage(message)}
}
export function checkInvitation(value) {
  const body = invitationBody(value)
  const message = FORMAT + '\n' + json(body)
  need(ethers.verifyMessage(message, value.nodeSignature).toLowerCase() === body.validator, 'Firma de nodo inválida.')
  need(ethers.verifyMessage(message, value.walletSignature).toLowerCase() === body.wallet, 'Firma de wallet inválida.')
  need(Object.keys(value).length === Object.keys(body).length + 2, 'La invitación contiene campos no reconocidos.')
  return {...body, nodeSignature: value.nodeSignature, walletSignature: value.walletSignature}
}
export function makeNetwork(invitations, options = {}) {
  need(Array.isArray(invitations) && invitations.length >= 4 && invitations.length <= 60, 'La práctica Besu requiere de 4 a 60 validadores. Para menos estudiantes, usar equipos o la simulación.')
  const participants = invitations.map(checkInvitation).sort((a, b) => a.id - b.id)
  participants.forEach((p, i) => need(p.id === i + 1, 'Numerar las invitaciones consecutivamente desde 1.'))
  for (const field of ['validator', 'wallet', 'publicKey']) need(new Set(participants.map(p => p[field])).size === participants.length, `Hay identidades repetidas: ${field}.`)
  need(new Set(participants.map(p => p.host + ':' + p.p2pPort)).size === participants.length, 'Dos nodos anuncian el mismo destino P2P.')
  need(new Set(participants.flatMap(p => [p.validator, p.wallet])).size === 2 * participants.length, 'Una wallet coincide con una clave de consenso de la red.')
  const title = options.title ?? 'Blockchain UTN: red privada de aula'
  need(typeof title === 'string' && title.length >= 1 && title.length <= 120, 'Título inválido.')
  const body = {format: FORMAT, image: IMAGE, title,
    chainId: integer(options.chainId ?? 20261029, 100000, 2147483647, 'chainId'),
    blockSeconds: integer(options.blockSeconds ?? 10, 2, 60, 'Segundos por bloque'),
    gasLimit: integer(options.gasLimit ?? 63000, 63000, 30000000, 'Límite de gas'),
    participants}
  return {...body, fingerprint: digest(body)}
}
export function checkNetwork(value) {
  need(value?.format === FORMAT && value.image === IMAGE, 'Formato o versión de Besu diferente del tutorial.')
  const expected = makeNetwork(value.participants, value)
  need(json(value) === json(expected), 'La huella o el contenido del archivo común no coincide. Usar el archivo original completo.')
  return expected
}
export function genesisExtra(addresses) {
  return ethers.encodeRlp([ZERO, addresses, [], '0x', []])
}
export function genesis(network) {
  const n = checkNetwork(network)
  return {
    config: {chainId: n.chainId, homesteadBlock: 0, eip150Block: 0, eip155Block: 0, eip158Block: 0,
      byzantiumBlock: 0, constantinopleBlock: 0, petersburgBlock: 0, istanbulBlock: 0,
      berlinBlock: 0, londonBlock: 0, shanghaiTime: 0,
      qbft: {blockperiodseconds: n.blockSeconds, epochlength: 30000, requesttimeoutseconds: Math.max(20, 2 * n.blockSeconds), blockreward: '0', pertxgaslimit: n.gasLimit}},
    nonce: '0x0', timestamp: '0x0',
    extraData: genesisExtra(n.participants.map(p => p.validator).sort()),
    gasLimit: ethers.toBeHex(n.gasLimit), difficulty: '0x1', mixHash: MIX,
    coinbase: '0x' + '00'.repeat(20),
    alloc: Object.fromEntries(n.participants.map(p => [p.wallet.slice(2), {balance: ethers.toBeHex(ethers.parseEther('100'))}])),
    number: '0x0', gasUsed: '0x0', parentHash: ZERO, baseFeePerGas: '0x3b9aca00'
  }
}
export const enode = p => `enode://${p.publicKey}@${p.host}:${p.p2pPort}`
export function compose(network, participant) {
  const n = checkNetwork(network)
  const p = n.participants.find(p => p.id === participant.id)
  need(p && json(p) === json(participant), 'El participante no pertenece a esta red.')
  return {name: `utn-besu-${n.fingerprint.slice(0, 10)}-${p.id}`, services: {besu: {
    image: IMAGE, restart: 'unless-stopped', stop_grace_period: '60s',
    mem_limit: '3g', cpus: 2, environment: {JAVA_OPTS: '-Xms512m -Xmx1536m'},
    extra_hosts: [`HOST_IP:${p.host}`],
    ports: [`${p.host}:${p.p2pPort}:${p.p2pPort}/tcp`, `${p.host}:${p.p2pPort}:${p.p2pPort}/udp`, `127.0.0.1:${p.rpcPort}:8545/tcp`],
    volumes: ['./genesis.json:/config/genesis.json:ro', './static-nodes.json:/config/static-nodes.json:ro', './clave-nodo:/config/clave-nodo:ro', 'cadena:/var/lib/besu'],
    command: ['--data-path=/var/lib/besu', '--genesis-file=/config/genesis.json', '--node-private-key-file=/config/clave-nodo',
      '--static-nodes-file=/config/static-nodes.json', '--bootnodes=', '--discovery-enabled=false',
      '--p2p-interface=0.0.0.0', `--p2p-host=${p.host}`, `--p2p-port=${p.p2pPort}`, '--nat-method=DOCKER',
      `--max-peers=${Math.max(25, n.participants.length + 5)}`, '--sync-mode=FULL', '--sync-min-peers=1',
      '--rpc-http-enabled=true', '--rpc-http-host=0.0.0.0', '--rpc-http-port=8545', '--rpc-http-api=ETH,NET,WEB3,QBFT,ADMIN,TXPOOL',
      '--host-allowlist=localhost,127.0.0.1', '--min-gas-price=0', '--min-priority-fee=0', `--target-gas-limit=${n.gasLimit}`]
  }}, volumes: {cadena: {}}}
}
