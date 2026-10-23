import test from 'node:test';
import assert from 'node:assert/strict';
import {ZeroAddress, ZeroHash} from 'ethers';
import {crear, huellaArchivo, proveedor} from '../scripts/comun.mjs';

test('Certificados: emision, aislamiento de registros y transiciones autorizadas', async () => {
  const p = await proveedor();
  try {
    const c = await crear(p), ana = await p.getSigner(0), bruno = await p.getSigner(1);
    const huella = await huellaArchivo('documentos/certificado-aula.txt');
    const otra = await huellaArchivo('documentos/certificado-alterado.txt');
    assert.notEqual(huella, otra);
    assert.equal(await c.autoridad(), await ana.getAddress());
    assert.deepEqual(Array.from(await c.consultar(huella)), [ZeroAddress, 0n]);
    await assert.rejects(c.connect(bruno).emitir.staticCall(huella), /NoAutorizado/);
    assert.equal((await c.consultar(huella)).estado, 0n);
    await assert.rejects(c.emitir.staticCall(ZeroHash), /HuellaVacia/);
    await assert.rejects(c.revocar.staticCall(huella), /NoVigente/);
    const emision = await (await c.emitir(huella)).wait();
    assert.equal(emision.status, 1);
    const emitido = c.interface.parseLog(emision.logs[0]);
    assert.equal(emitido.name, 'CertificadoEmitido');
    assert.equal(emitido.args.huella, huella);
    assert.equal(emitido.args.emisor, await ana.getAddress());
    assert.deepEqual(Array.from(await c.consultar(huella)), [await ana.getAddress(), 1n]);
    assert.equal((await c.consultar(otra)).estado, 0n);
    await assert.rejects(c.emitir.staticCall(huella), /YaRegistrado/);
    await assert.rejects(c.connect(bruno).revocar.staticCall(huella), /NoAutorizado/);
    assert.equal((await c.consultar(huella)).estado, 1n);
    await (await c.emitir(otra)).wait();
    const revocacion = await (await c.revocar(huella)).wait();
    const revocado = c.interface.parseLog(revocacion.logs[0]);
    assert.equal(revocado.name, 'CertificadoRevocado');
    assert.equal(revocado.args.huella, huella);
    assert.equal(revocado.args.autor, await ana.getAddress());
    assert.deepEqual(Array.from(await c.consultar(huella)), [await ana.getAddress(), 2n]);
    assert.equal((await c.consultar(otra)).estado, 1n);
    await assert.rejects(c.revocar.staticCall(huella), /NoVigente/);
    await assert.rejects(c.emitir.staticCall(huella), /YaRegistrado/);
    assert.equal((await c.consultar(huella)).estado, 2n);
  } finally { p.destroy(); }
});
