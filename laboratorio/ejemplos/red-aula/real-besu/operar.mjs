import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'
import ethers from '../vendor/ethers.umd.cjs'
import { checkNetwork, genesis, digest, json, integer, enode } from './configuracion.mjs'

export function rpcClient(url, fetcher = fetch) {
  const parsed = new URL(url)
  if (parsed.protocol !== 'http:' || parsed.hostname !== '127.0.0.1' || parsed.username || parsed.password || parsed.pathname !== '/' || parsed.search || parsed.hash) throw new Error('La herramienta solo usa el RPC local 127.0.0.1 de esta práctica.')
  let id = 0
  return async (method, params = []) => {
    const requestId = ++id
    const response = await fetcher(url, {method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({jsonrpc: '2.0', id: requestId, method, params}), signal: AbortSignal.timeout(15000)})
    if (!response.ok) throw new Error(`RPC HTTP ${response.status}. Revisar si el contenedor está iniciado.`)
    const body = await response.json()
    if (body.id !== requestId || body.jsonrpc !== '2.0') throw new Error('Respuesta RPC incompatible.')
    if (body.error) throw new Error(`${method}: ${body.error.message}`)
    if (!Object.hasOwn(body, 'result')) throw new Error('Falta el resultado RPC.')
    return body.result
  }
}
export async function context(directory, fetcher) {
  const network = checkNetwork(JSON.parse(await readFile(path.join(directory, 'red-besu.json'), 'utf8')))
  const local = JSON.parse(await readFile(path.join(directory, 'configurado.json'), 'utf8'))
  const participant = network.participants.find(p => p.id === local.id)
  if (!participant || local.fingerprint !== network.fingerprint || local.genesisFileSHA256 !== digest(genesis(network)) || local.rpc !== `http://127.0.0.1:${participant.rpcPort}`) throw new Error('La configuración local no coincide con el archivo común.')
  const rpc = rpcClient(local.rpc, fetcher)
  const [chainId, info, block0] = await Promise.all([rpc('eth_chainId'), rpc('admin_nodeInfo'), rpc('eth_getBlockByNumber', ['0x0', false])])
  if (BigInt(chainId) !== BigInt(network.chainId)) throw new Error('El RPC pertenece a otra red. No se envió ninguna operación.')
  if (info?.enode?.split('@')[0] !== enode(participant).split('@')[0]) throw new Error('El RPC no corresponde a tu identidad de nodo.')
  const g = genesis(network)
  if (!block0 || block0.extraData?.toLowerCase() !== g.extraData.toLowerCase() || BigInt(block0.gasLimit) !== BigInt(g.gasLimit) || block0.mixHash?.toLowerCase() !== g.mixHash) throw new Error('El génesis del nodo no corresponde a esta práctica.')
  return {network, local, participant, rpc, genesisHash: block0.hash}
}
export function feeBreakdown(receipt, block) {
  if (receipt.blockHash !== block.hash) throw new Error('El recibo y el bloque no coinciden.')
  const gas = BigInt(receipt.gasUsed), price = BigInt(receipt.effectiveGasPrice), base = BigInt(block.baseFeePerGas)
  if (price < base) throw new Error('Precio efectivo menor que la tarifa base.')
  return {gasUsed: gas.toString(), effectiveGwei: ethers.formatUnits(price, 'gwei'), baseGwei: ethers.formatUnits(base, 'gwei'),
    feeETH: ethers.formatEther(gas * price), burnedETH: ethers.formatEther(gas * base), tipETH: ethers.formatEther(gas * (price - base)),
    feeRecipient: block.miner, status: Number(BigInt(receipt.status))}
}
export async function status(ctx, blockNumber) {
  const {rpc, network, participant} = ctx
  const tag = blockNumber === undefined ? 'latest' : ethers.toQuantity(integer(blockNumber, 0, Number.MAX_SAFE_INTEGER, 'Bloque'))
  const [version, peerCount, peers, validators, block, balance, pool] = await Promise.all([
    rpc('web3_clientVersion'), rpc('net_peerCount'), rpc('admin_peers'), rpc('qbft_getValidatorsByBlockNumber', ['latest']),
    rpc('eth_getBlockByNumber', [tag, true]), rpc('eth_getBalance', [participant.wallet, 'latest']), rpc('txpool_besuStatistics')
  ])
  if (!block) throw new Error('El bloque pedido todavía no está disponible en tu nodo.')
  const receipts = await Promise.all(block.transactions.map(tx => rpc('eth_getTransactionReceipt', [tx.hash])))
  const proposer = network.participants.find(p => p.validator === block.miner.toLowerCase())
  return {format: 'utn-besu-evidence/v1', at: new Date().toISOString(), fingerprint: network.fingerprint,
    chainId: network.chainId, genesisHash: ctx.genesisHash, student: {id: participant.id, name: participant.name, validator: participant.validator},
    client: version, peers: Number(BigInt(peerCount)), connectedIds: peers.map(p => p.id), validators,
    wallet: participant.wallet, balanceETH: ethers.formatEther(BigInt(balance)), pool,
    block: {number: Number(BigInt(block.number)), hash: block.hash, parentHash: block.parentHash, stateRoot: block.stateRoot,
      timestamp: Number(BigInt(block.timestamp)), proposer: proposer ? `${proposer.id}: ${proposer.name}` : block.miner,
      gasLimit: Number(BigInt(block.gasLimit)), gasUsed: Number(BigInt(block.gasUsed)), baseGwei: ethers.formatUnits(BigInt(block.baseFeePerGas), 'gwei'),
      transactions: block.transactions.map((tx, i) => ({hash: tx.hash, from: tx.from, to: tx.to, nonce: Number(BigInt(tx.nonce)), ...feeBreakdown(receipts[i], block)}))}}
}
export async function send(ctx, directory, {toId, amount = '0.001', priority = '2', maximum = '100', nonce}) {
  const to = ctx.network.participants.find(p => p.id === integer(toId, 1, ctx.network.participants.length, 'Destinatario'))
  const record = JSON.parse(await readFile(path.join(directory, 'wallet-privada.json'), 'utf8'))
  const wallet = new ethers.Wallet(record.privateKey)
  if (wallet.address.toLowerCase() !== ctx.participant.wallet) throw new Error('La wallet privada no corresponde a tu invitación.')
  const value = ethers.parseEther(amount), tip = ethers.parseUnits(priority, 'gwei'), cap = ethers.parseUnits(maximum, 'gwei')
  if (value <= 0n || tip < 0n || cap <= 0n || tip > cap) throw new Error('Revisar importe positivo y tarifas: máximo mayor o igual que propina.')
  const nextNonce = nonce === undefined ? Number(BigInt(await ctx.rpc('eth_getTransactionCount', [wallet.address, 'pending']))) : integer(nonce, 0, Number.MAX_SAFE_INTEGER, 'Nonce')
  const raw = await wallet.signTransaction({type: 2, chainId: ctx.network.chainId, nonce: nextNonce,
    to: to.wallet, value, gasLimit: 21000n, maxFeePerGas: cap, maxPriorityFeePerGas: tip})
  return {hash: await ctx.rpc('eth_sendRawTransaction', [raw]), from: wallet.address, to: to.wallet, nonce: nextNonce,
    eth: amount, maxGwei: maximum, priorityGwei: priority, note: 'Transmitida. Consultar el recibo para comprobar inclusión y gasto.'}
}
export function compare(evidence) {
  if (evidence.length < 2) throw new Error('Comparar al menos dos archivos de evidencia.')
  const a = evidence[0]
  if (evidence.some(x => x.format !== 'utn-besu-evidence/v1')) throw new Error('Formato de evidencia inválido.')
  const same = evidence.every(x => x.fingerprint === a.fingerprint && x.chainId === a.chainId && x.genesisHash === a.genesisHash &&
    x.block.number === a.block.number && x.block.hash === a.block.hash && x.block.stateRoot === a.block.stateRoot)
  const distinct = new Set(evidence.map(x => x.student.validator)).size === evidence.length
  return {sameBlockAndState: same, distinctNodes: distinct, reports: evidence.length, block: a.block.number,
    note: 'Los archivos son observaciones exportadas. Esta comparación no reemplaza la validación interna de Besu ni autentica archivos modificados a mano.'}
}
async function main() {
  const {values: v, positionals: [command, ...files]} = parseArgs({allowPositionals: true, options: {
    datos: {type: 'string'}, a: {type: 'string'}, eth: {type: 'string', default: '0.001'},
    propina: {type: 'string', default: '2'}, maximo: {type: 'string', default: '100'}, nonce: {type: 'string'},
    hash: {type: 'string'}, bloque: {type: 'string'}, salida: {type: 'string'}
  }})
  let result
  if (command === 'comparar') {
    result = compare(await Promise.all(files.map(async f => JSON.parse(await readFile(f, 'utf8')))))
    if (!result.sameBlockAndState || !result.distinctNodes) process.exitCode = 1
  } else {
    if (!v.datos) throw new Error('Indicar --datos datos-besu-1.')
    const ctx = await context(v.datos)
    if (command === 'estado') result = await status(ctx, v.bloque)
    else if (command === 'enviar') result = await send(ctx, v.datos, {toId: v.a, amount: v.eth, priority: v.propina, maximum: v.maximo, nonce: v.nonce})
    else if (command === 'recibo') {
      if (!/^0x[0-9a-fA-F]{64}$/.test(v.hash)) throw new Error('Indicar --hash HASH_DE_TRANSACCION.')
      const receipt = await ctx.rpc('eth_getTransactionReceipt', [v.hash])
      result = receipt ? {hash: v.hash, block: Number(BigInt(receipt.blockNumber)), blockHash: receipt.blockHash,
        ...feeBreakdown(receipt, await ctx.rpc('eth_getBlockByHash', [receipt.blockHash, false]))} : {hash: v.hash, status: 'Sin recibo en este nodo. Puede estar pendiente, no haber llegado o haber sido descartada.'}
    } else throw new Error('Elegir estado, enviar, recibo o comparar. Consultar el tutorial.')
  }
  if (v.salida) await writeFile(v.salida, json(result), {flag: 'wx'})
  console.log(json(result))
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch(error => { console.error(error.message); process.exitCode = 1 })
