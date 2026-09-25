import {mkdir,writeFile} from 'node:fs/promises';
import {local,desplegar} from './comun.mjs';
import {formatEther,formatUnits} from 'ethers';
const p=await local();try{const c=await desplegar('Contador',await p.getSigner(0));const registros=[];
for(const [operacion,tx] of [['despliegue',c.deploymentTransaction()],['incrementar',await c.incrementar()],['reiniciar',await c.reiniciar()]]){const r=await tx.wait();registros.push({operacion,gasUsed:r.gasUsed.toString(),effectiveGasPriceGwei:formatUnits(r.gasPrice,'gwei'),costoETH:formatEther(r.gasUsed*r.gasPrice),hash:r.hash});}
await mkdir('resultados',{recursive:true});await writeFile('resultados/gas-local.json',JSON.stringify(registros,null,2));console.table(registros);console.log('Datos locales: no equivalen a una cotización ni a costos actuales de producción.');}finally{p.destroy();}
