import { readFile } from 'node:fs/promises';
import { ContractFactory, JsonRpcProvider } from 'ethers';
export async function artefacto(nombre,archivo=nombre) { return JSON.parse(await readFile(new URL(`../artifacts/contracts/${archivo}.sol/${nombre}.json`,import.meta.url),'utf8')); }
export async function local() { const p=new JsonRpcProvider(process.env.LAB_RPC_URL||'http://127.0.0.1:8545',undefined,{cacheTimeout:-1}); if((await p.getNetwork()).chainId!==31337n) {p.destroy();throw Error('Este script requiere la red local 31337.');} return p; }
export async function desplegar(nombre,signer,args=[],archivo=nombre) { const a=await artefacto(nombre,archivo); const c=await new ContractFactory(a.abi,a.bytecode,signer).deploy(...args); await c.waitForDeployment(); return c; }
export function costoETH(gas,precioGwei){if(!Number.isFinite(gas)||!Number.isFinite(precioGwei)||gas<0||precioGwei<0)throw Error('Entradas inválidas');return gas*precioGwei/1e9;}

// Modelo mensual didáctico. No lee ni corrige una planilla entregada.
export function presupuestoUso({usuarios,operaciones,gas,precioGwei,ethUSD,abono,fijos,patrocinio}) {
  const valores=[usuarios,operaciones,gas,precioGwei,ethUSD,abono,fijos];
  if(valores.some(v=>!Number.isFinite(v)||v<0)||![usuarios,operaciones,gas].every(Number.isInteger)||![0,1].includes(patrocinio)) throw Error('Entradas inválidas');
  const comisionETH=costoETH(gas,precioGwei),comisionUSD=comisionETH*ethUSD;
  const gasUsuario=operaciones*comisionUSD,gasTotal=usuarios*gasUsuario;
  const ingresos=usuarios*abono,gastos=fijos+patrocinio*gasTotal;
  const contribucion=abono-patrocinio*gasUsuario;
  return {comisionETH,comisionUSD,gasUsuario,gasTotal,costoUsuario:abono+(1-patrocinio)*gasUsuario,ingresos,gastos,resultado:ingresos-gastos,contribucion,equilibrio:contribucion>0?Math.ceil(fijos/contribucion):null};
}
