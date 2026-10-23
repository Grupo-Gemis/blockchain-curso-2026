import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {Contract, ContractFactory, JsonRpcProvider, keccak256} from 'ethers';

export const urlRPC = process.env.CERTIFICADOS_RPC_URL || 'http://127.0.0.1:19645';
export const huellaArchivo = async archivo => '0x' + createHash('sha256').update(await readFile(archivo)).digest('hex');
export async function artefacto() {
  return JSON.parse(await readFile('artifacts/contracts/RegistroCertificados.sol/RegistroCertificados.json', 'utf8'));
}
export async function proveedor() {
  const p = new JsonRpcProvider(urlRPC, undefined, {cacheTimeout: -1});
  p.pollingInterval = 100;
  try {
    if ((await p.getNetwork()).chainId !== 31337n) throw Error('Se requiere la red de practica 31337 en el puerto 19645.');
    return p;
  } catch (error) { p.destroy(); throw error; }
}
export async function crear(p) {
  const a = await artefacto();
  const c = await new ContractFactory(a.abi, a.bytecode, await p.getSigner(0)).deploy();
  await c.waitForDeployment();
  return c;
}
export async function instancia(p) {
  const registro = JSON.parse(await readFile('ui/despliegue.json', 'utf8'));
  if (registro.chainId !== 31337 || registro.rpc !== urlRPC) throw Error('El registro corresponde a otro entorno.');
  const codigo = await p.getCode(registro.direccion);
  const recibo = await p.getTransactionReceipt(registro.hash);
  if (codigo === '0x' || keccak256(codigo) !== registro.runtimeCodeHash || !recibo || recibo.status !== 1 || recibo.contractAddress?.toLowerCase() !== registro.direccion.toLowerCase()) {
    throw Error('La instancia guardada no esta disponible o no coincide. Comproba el nodo y realiza un nuevo despliegue.');
  }
  return new Contract(registro.direccion, registro.abi, p);
}
export function nombreError(error) {
  return error.revert?.name || error.shortMessage || error.message;
}
