import {mkdir, writeFile} from 'node:fs/promises';
import {keccak256} from 'ethers';
import {artefacto, crear, proveedor, urlRPC} from './comun.mjs';

const p = await proveedor();
try {
  const c = await crear(p), direccion = await c.getAddress();
  const recibo = await c.deploymentTransaction().wait();
  const registro = {
    chainId: 31337, rpc: urlRPC, direccion, hash: recibo.hash,
    autoridad: await c.autoridad(), runtimeCodeHash: keccak256(await p.getCode(direccion)),
    algoritmoDocumento: 'SHA-256', abi: (await artefacto()).abi
  };
  await mkdir('ui', {recursive: true});
  await writeFile('ui/despliegue.json', JSON.stringify(registro, null, 2) + '\n');
  console.log('Registro creado sin certificados. Red: 31337. Puerto RPC: 19645.');
  console.log('Direccion: ' + direccion + '\nAutoridad (Ana): ' + registro.autoridad);
  console.log('Registro guardado en ui/despliegue.json. No se emitio ningun certificado.');
} finally { p.destroy(); }
