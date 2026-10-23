import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {crear, huellaArchivo, proveedor} from './comun.mjs';

// Crea su propia instancia. No modifica la instancia de la interfaz.
const p = await proveedor();
try {
  const c = await crear(p), ana = await p.getSigner(0), bruno = await p.getSigner(1);
  const original = await huellaArchivo('documentos/certificado-aula.txt');
  const alterado = await huellaArchivo('documentos/certificado-alterado.txt');
  const estados = [];
  const observar = async paso => {
    const [emisor, estado] = await c.consultar(original);
    estados.push({paso, estado: Number(estado), emisor});
  };
  await observar('Inicial');
  await assert.rejects(c.connect(bruno).emitir.staticCall(original), /NoAutorizado/);
  await observar('Emision de Bruno rechazada antes del envio');
  const emision = await (await c.connect(ana).emitir(original)).wait();
  await observar('Ana emite');
  await assert.rejects(c.emitir.staticCall(original), /YaRegistrado/);
  assert.equal((await c.consultar(alterado)).estado, 0n);
  await assert.rejects(c.connect(bruno).revocar.staticCall(original), /NoAutorizado/);
  await observar('Revocacion de Bruno rechazada antes del envio');
  const revocacion = await (await c.revocar(original)).wait();
  await observar('Ana revoca');
  await assert.rejects(c.emitir.staticCall(original), /YaRegistrado/);
  assert.deepEqual(estados.map(x => x.estado), [0, 0, 1, 1, 2]);
  const gas = [ ['emitir', emision], ['revocar', revocacion] ].map(([operacion, r]) => ({
    operacion, hash: r.hash, gasUsed: r.gasUsed.toString(), precioWeiPorGas: r.gasPrice.toString(),
    comisionWei: (r.gasUsed * r.gasPrice).toString()
  }));
  const informe = {chainId: 31337, rpc: '127.0.0.1:19645', direccion: await c.getAddress(),
    algoritmoDocumento: 'SHA-256', original, alterado, estados, gas,
    alcance: 'Instancia independiente de la interfaz. Rechazos comprobados con eth_call. Sin pagos reales ni conversion a dolares.'};
  await mkdir('resultados', {recursive: true});
  await writeFile('resultados/recorrido-certificados.json', JSON.stringify(informe, null, 2) + '\n');
  console.table(estados);
  console.table(gas);
  console.log('Archivo alterado: Inexistente. Informe: resultados/recorrido-certificados.json');
  console.log('La instancia de la interfaz conserva su propio estado.');
} finally { p.destroy(); }
