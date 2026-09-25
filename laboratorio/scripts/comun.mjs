import { readFile } from 'node:fs/promises';
import { ContractFactory, JsonRpcProvider } from 'ethers';
export async function artefacto(nombre,archivo=nombre) { return JSON.parse(await readFile(new URL(`../artifacts/contracts/${archivo}.sol/${nombre}.json`,import.meta.url),'utf8')); }
export async function local() { const p=new JsonRpcProvider(process.env.LAB_RPC_URL||'http://127.0.0.1:8545'); if((await p.getNetwork()).chainId!==31337n) {p.destroy();throw Error('Este script requiere la red local 31337.');} return p; }
export async function desplegar(nombre,signer,args=[],archivo=nombre) { const a=await artefacto(nombre,archivo); const c=await new ContractFactory(a.abi,a.bytecode,signer).deploy(...args); await c.waitForDeployment(); return c; }
export function costoETH(gas,precioGwei){if(!Number.isFinite(gas)||!Number.isFinite(precioGwei)||gas<0||precioGwei<0)throw Error('Entradas inválidas');return gas*precioGwei/1e9;}
