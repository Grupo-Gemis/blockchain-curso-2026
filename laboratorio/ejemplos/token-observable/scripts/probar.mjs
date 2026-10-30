import {spawn} from 'node:child_process'
import {setTimeout as delay} from 'node:timers/promises'
import {createServer} from 'node:net'
const url = 'http://127.0.0.1:19686'
const probe = createServer()
await new Promise((resolve, reject) => {probe.once('error', reject);probe.listen(19686, '127.0.0.1', resolve)})
await new Promise(resolve => probe.close(resolve))
const child = spawn(process.execPath, ['node_modules/hardhat/dist/src/cli.js','node','--network','hardhatMainnet','--hostname','127.0.0.1','--port','19686'], {stdio: ['ignore','ignore','pipe']})
let errorText = ''
child.stderr.on('data', data => {errorText += data})
try {
  let ready = false
  for (let i = 0; i < 100; i++) {
    if (child.exitCode !== null) throw Error('El nodo de pruebas no pudo iniciar: ' + errorText)
    await delay(100)
    try {
      const r = await fetch(url, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: []})})
      ready = (await r.json()).result === '0x7a69'
      if (ready) break
    } catch {}
  }
  if (!ready) throw Error('El nodo de pruebas no respondió.')
  const tests = spawn(process.execPath, ['--test', 'tests/token.test.mjs'], {stdio: 'inherit', env: {...process.env, LAB_RPC_URL: url}})
  process.exitCode = await new Promise(resolve => tests.once('exit', code => resolve(code ?? 1)))
} finally {
  child.kill('SIGTERM')
  if (child.exitCode === null) await new Promise(resolve => child.once('exit', resolve))
}
