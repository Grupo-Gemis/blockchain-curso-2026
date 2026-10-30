import {readFile, mkdir, writeFile} from 'node:fs/promises'
import {JsonRpcProvider} from 'ethers'
import {TokenSession, serialize} from '../ui/operaciones.mjs'
const provider = new JsonRpcProvider('http://127.0.0.1:19685', undefined, {cacheTimeout: -1, batchMaxCount: 1})
try {
  const artifact = JSON.parse(await readFile('artifacts/contracts/TokenAula.sol/TokenAula.json', 'utf8'))
  const s = new TokenSession(provider, artifact)
  await s.connect()
  await s.create()
  await s.transfer(0, 1, '10')
  await s.approve(0, 1, '3')
  await s.transferFrom(1, 0, 2, '2')
  await s.simulate(1, 0, 2, '2')
  await s.transferFrom(1, 0, 2, '2', true)
  await s.approve(0, 1, '0')
  await mkdir('resultados', {recursive: true})
  await writeFile('resultados/token-observable.json', serialize(s.report()) + '\n')
  console.table(s.records.map(r => ({operacion: r.operation, actor: r.actor, tipo: r.kind, status: r.status ?? 'Sin envío', gas: r.gasUsed, feeETH: r.feeETH ?? '0'})))
  console.log('Informe público de este ensayo: resultados/token-observable.json. No distribuye porcentajes ni implementa vesting.')
} finally {provider.destroy()}
