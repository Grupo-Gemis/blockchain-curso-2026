import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, writeFile, stat } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import ethers from '../vendor/ethers.umd.cjs'
import { invitation, checkInvitation, makeNetwork, checkNetwork, genesis, genesisExtra, compose, enode, json, ZERO, IMAGE } from '../real-besu/configuracion.mjs'
import { createIdentity, configure, collect } from '../real-besu/preparar.mjs'
import { rpcClient, context, feeBreakdown, send, compare } from '../real-besu/operar.mjs'

const invitations = await Promise.all(Array.from({length: 60}, (_, i) => invitation({id: i + 1, name: `Estudiante ${i + 1}`, host: `100.80.1.${i + 10}`}, ethers.Wallet.createRandom(), ethers.Wallet.createRandom())))

test('Besu: invitaciones vinculadas a dos claves propias y rechazo de alteraciones', () => {
  const a = invitations[0]
  assert.deepEqual(checkInvitation(a), a)
  assert.throws(() => checkInvitation({...a, host: '100.80.2.10'}), /Firma/)
  assert.throws(() => checkInvitation({...a, nodeSignature: invitations[1].nodeSignature}))
  assert.throws(() => checkInvitation({...a, privateKey: 'no debe compartirse'}), /campos/)
  assert.throws(() => checkInvitation({...a, host: '127.0.0.1'}), /privada/)
})
test('Besu: un génesis común para cohortes variables, transacciones reales y cero recompensa de bloque', () => {
  for (const count of [4, 6, 10, 17, 60]) {
    const n = makeNetwork(invitations.slice(0, count))
    assert.deepEqual(checkNetwork(n), n)
    const g = genesis(n)
    assert.equal(g.config.chainId, 20261029)
    assert.equal(g.config.qbft.blockreward, '0')
    assert.equal(g.config.londonBlock, 0)
    assert.equal(g.config.shanghaiTime, 0)
    assert.equal(Object.keys(g.alloc).length, count)
    assert.equal(ethers.decodeRlp(g.extraData)[1].length, count)
    assert.equal(ethers.decodeRlp(g.extraData)[0], ZERO)
    assert.equal(json(n).includes('privateKey'), false)
    assert.throws(() => checkNetwork({...n, gasLimit: 126000}), /huella/)
  }
  assert.throws(() => makeNetwork(invitations.slice(0, 3)), /4 a 60/)
  assert.throws(() => makeNetwork([invitations[0], invitations[0], ...invitations.slice(2, 4)]))
})
test('Besu: codificación RLP compatible con el vector de génesis QBFT de la documentación oficial', () => {
  const addresses = ['0x4592c8e45706cc08b8f44b11e43cba0cfc5892cb', '0x06e23768a0f59cf365e18c2e0c89e151bcdedc70', '0xc5327f96ee02d7bcbc1bf1236b8c15148971e1de', '0xab5e7f4061c605820d3744227eed91ff8e2c8908']
  assert.equal(genesisExtra(addresses), '0xf87aa00000000000000000000000000000000000000000000000000000000000000000f854944592c8e45706cc08b8f44b11e43cba0cfc5892cb9406e23768a0f59cf365e18c2e0c89e151bcdedc7094c5327f96ee02d7bcbc1bf1236b8c15148971e1de94ab5e7f4061c605820d3744227eed91ff8e2c8908c080c0')
})
test('Besu: cada nodo usa pares directos, RPC local, imagen fija y volumen persistente', () => {
  const n = makeNetwork(invitations.slice(0, 10))
  const a = compose(n, n.participants[0]), b = compose(n, n.participants[1])
  assert.notEqual(a.name, b.name)
  assert.equal(a.services.besu.image, IMAGE)
  assert.ok(a.services.besu.ports.includes('127.0.0.1:8545:8545/tcp'))
  assert.ok(a.services.besu.ports.includes('100.80.1.10:30303:30303/tcp'))
  assert.ok(a.services.besu.command.includes('--nat-method=DOCKER'))
  assert.ok(a.services.besu.command.includes('--bootnodes='))
  assert.ok(a.services.besu.volumes.includes('cadena:/var/lib/besu'))
  assert.equal(a.services.besu.volumes.some(v => v.includes('wallet-privada')), false)
})
test('Besu: preparación de archivos sin sobrescribir identidades y configuración ajena', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'utn-besu-test-'))
  const dirs = Array.from({length: 4}, (_, i) => path.join(root, `nodo-${i + 1}`))
  const pubs = await Promise.all(dirs.map((dir, i) => createIdentity(dir, {id: i + 1, name: `Nodo ${i + 1}`, host: `10.5.0.${i + 1}`})))
  const n = makeNetwork(pubs)
  await Promise.all(dirs.map(dir => configure(dir, n)))
  const key = await readFile(path.join(dirs[0], 'clave-nodo'), 'utf8')
  await assert.rejects(createIdentity(dirs[0], {id: 1, name: 'Otra', host: '10.5.0.1'}), /EEXIST/)
  await configure(dirs[0], n)
  await assert.rejects(configure(dirs[0], makeNetwork(pubs, {chainId: 20269999})), /otra|otro/)
  assert.equal(await readFile(path.join(dirs[0], 'clave-nodo'), 'utf8'), key)
  assert.equal((await stat(path.join(dirs[0], 'wallet-privada.json'))).mode & 0o777, 0o600)
  const peers = JSON.parse(await readFile(path.join(dirs[0], 'static-nodes.json'), 'utf8'))
  assert.deepEqual(peers, pubs.slice(1).map(enode))
  const folder = path.join(root, 'publicas')
  await mkdir(folder)
  await Promise.all(pubs.map((p, i) => writeFile(path.join(folder, `${i}.json`), json(p))))
  const out = path.join(root, 'red-besu.json')
  assert.deepEqual(await collect(folder, {}, out), n)
  await assert.rejects(collect(folder, {}, out), /EEXIST/)
  // Ninguna prueba inicia Besu. El transporte siguiente es inyectado.
  const calls = []
  const fetcher = async (_url, request) => {
    const r = JSON.parse(request.body); calls.push(r)
    let result
    if (r.method === 'eth_chainId') result = ethers.toQuantity(n.chainId)
    else if (r.method === 'admin_nodeInfo') result = {enode: enode(pubs[0])}
    else if (r.method === 'eth_getBlockByNumber') result = {...genesis(n), hash: ZERO}
    else if (r.method === 'eth_getTransactionCount') result = '0x0'
    else if (r.method === 'eth_sendRawTransaction') result = ethers.keccak256(r.params[0])
    else throw new Error('Método inesperado')
    return {ok: true, json: async () => ({jsonrpc: '2.0', id: r.id, result})}
  }
  const ctx = await context(dirs[0], fetcher)
  await send(ctx, dirs[0], {toId: 2})
  const tx = ethers.Transaction.from(calls.find(c => c.method === 'eth_sendRawTransaction').params[0])
  assert.equal(tx.chainId, BigInt(n.chainId))
  assert.equal(tx.to.toLowerCase(), pubs[1].wallet)
  assert.equal(tx.from.toLowerCase(), pubs[0].wallet)
  assert.equal(tx.gasLimit, 21000n)
  await assert.rejects(context(dirs[0], async (_url, req) => ({ok: true, json: async () => ({jsonrpc: '2.0', id: JSON.parse(req.body).id, result: JSON.parse(req.body).method === 'eth_chainId' ? '0x1' : {}})})), /otra red/)
})
test('Besu: recibo EIP-1559 separa base quemada y propina de un bloque identificado', () => {
  const result = feeBreakdown({blockHash: ZERO, gasUsed: '0x5208', effectiveGasPrice: ethers.toQuantity(22000000000n), status: '0x1'},
    {hash: ZERO, baseFeePerGas: ethers.toQuantity(20000000000n), miner: invitations[0].validator})
  assert.equal(result.feeETH, '0.000462')
  assert.equal(result.burnedETH, '0.00042')
  assert.equal(result.tipETH, '0.000042')
  assert.throws(() => feeBreakdown({blockHash: 'otro'}, {hash: ZERO}), /no coinciden/)
})
test('Besu: solo RPC local y comparación de un mismo bloque de nodos distintos', () => {
  assert.throws(() => rpcClient('http://100.80.1.11:8545'), /local/)
  const a = {format: 'utn-besu-evidence/v1', fingerprint: 'f', chainId: 20261029, genesisHash: ZERO, student: {validator: 'a'}, block: {number: 8, hash: 'h', stateRoot: 's'}}
  const b = {...a, student: {validator: 'b'}}
  assert.equal(compare([a, b]).sameBlockAndState, true)
  assert.equal(compare([a, a]).distinctNodes, false)
  assert.equal(compare([a, {...b, block: {...b.block, number: 9}}]).sameBlockAndState, false)
})
