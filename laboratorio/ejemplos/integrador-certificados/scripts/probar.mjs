import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {setTimeout} from 'node:timers/promises';

// Las pruebas usan otro nodo y otra instancia que la interfaz de 19645.
const puerto = 19646, url = 'http://127.0.0.1:' + puerto;
const reserva = createServer();
await new Promise((resolve, reject) => { reserva.once('error', reject); reserva.listen(puerto, '127.0.0.1', resolve); });
await new Promise(resolve => reserva.close(resolve));
const nodo = spawn(process.execPath, ['node_modules/hardhat/dist/src/cli.js', 'node', '--network', 'hardhatMainnet', '--hostname', '127.0.0.1', '--port', String(puerto)], {stdio: ['ignore', 'ignore', 'pipe']});
let errorNodo = ''; nodo.stderr.on('data', b => { errorNodo += b; });
try {
  let listo = false;
  for (let i = 0; i < 100; i++) {
    if (nodo.exitCode !== null) throw Error('No se inicio el nodo de pruebas: ' + errorNodo);
    try {
      const r = await fetch(url, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: []}), signal: AbortSignal.timeout(1000)});
      listo = (await r.json()).result === '0x7a69'; if (listo) break;
    } catch {}
    await setTimeout(100);
  }
  if (!listo) throw Error('No responde el nodo de pruebas.');
  const pruebas = spawn(process.execPath, ['--test', 'tests/registro.test.mjs'], {stdio: 'inherit', env: {...process.env, CERTIFICADOS_RPC_URL: url}});
  process.exitCode = await new Promise((resolve, reject) => { pruebas.once('error', reject); pruebas.once('exit', code => resolve(code ?? 1)); });
} finally {
  nodo.kill('SIGTERM');
  if (nodo.exitCode === null) await new Promise(resolve => nodo.once('exit', resolve));
}
