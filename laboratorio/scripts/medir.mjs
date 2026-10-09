import {mkdir,writeFile} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import {local,desplegar,artefacto} from './comun.mjs';
import {formatEther,formatUnits,keccak256} from 'ethers';
const p=await local();
try {
  const c=await desplegar('Contador',await p.getSigner(0));
  const registros=[];
  async function registrar(operacion,tx,valorAntes) {
    const r=await tx.wait();
    if(!r || r.status!==1) throw Error('La operación medida no terminó correctamente.');
    registros.push({operacion,valorAntes,valorDespues:(await c.valor()).toString(),gasLimit:tx.gasLimit.toString(),gasUsed:r.gasUsed.toString(),effectiveGasPriceGwei:formatUnits(r.gasPrice,'gwei'),comisionETH:formatEther(r.gasUsed*r.gasPrice),hash:r.hash,bloque:r.blockNumber});
  }
  await registrar('despliegue',c.deploymentTransaction(),null);
  await registrar('incrementar 0 → 1',await c.incrementar(),'0');
  await registrar('incrementar 1 → 2',await c.incrementar(),'1');
  await registrar('reiniciar 2 → 0',await c.reiniciar(),'2');
  const config=readFileSync('hardhat.config.ts','utf8');
  if(!config.includes('version:"0.8.28"')||!config.includes('runs:200')||!config.includes('evmVersion:"cancun"')) throw Error('Revisá los settings antes de registrar la medición.');
  const configuracion={solidity:'0.8.28',optimizer:{enabled:true,runs:200},evmVersion:'cancun',hardhat:JSON.parse(readFileSync('package.json','utf8')).devDependencies.hardhat};
  const informe={chainId:Number((await p.getNetwork()).chainId),contrato:await c.getAddress(),cuenta:await(await p.getSigner(0)).getAddress(),creationBytecodeHash:keccak256((await artefacto('Contador')).bytecode),configuracion,constructor:[],registros,alcance:'Nueva instancia local para medir. No modifica ui/despliegue.json ni representa precios de otra red.'};
  await mkdir('resultados',{recursive:true});
  await writeFile('resultados/gas-local.json',JSON.stringify(informe,null,2));
  console.table(registros);
  console.log('Informe: resultados/gas-local.json. Conservá este archivo junto con el fuente y package-lock.json usados.');
} finally {p.destroy();}
