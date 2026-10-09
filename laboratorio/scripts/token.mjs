import {mkdir,writeFile} from 'node:fs/promises';
import {local,desplegar} from './comun.mjs';
import {formatUnits,parseUnits} from 'ethers';
const p=await local();
try {
  const a=await p.getSigner(0),b=await p.getSigner(1);
  const ana=await a.getAddress(),bruno=await b.getAddress();
  const c=await desplegar('TokenAula',a,[ana]);
  const decimals=Number(await c.decimals()),oferta=await c.totalSupply(),registros=[];
  const unidades=cantidad=>parseUnits(cantidad,decimals);
  async function observar(operacion,recibo=null) {
    const estado={operacion,saldoAna:formatUnits(await c.balanceOf(ana),decimals),saldoBruno:formatUnits(await c.balanceOf(bruno),decimals),permisoAnaParaBruno:formatUnits(await c.allowance(ana,bruno),decimals),ofertaTotal:formatUnits(await c.totalSupply(),decimals),hash:recibo?.hash??null};
    if(await c.totalSupply()!==oferta) throw Error('La oferta cambió durante el recorrido.');
    registros.push(estado);
    return estado;
  }
  await observar('emisión inicial',await c.deploymentTransaction().wait());
  await observar('Ana transfiere 10 AULA',await(await c.transfer(bruno,unidades('10'))).wait());
  await observar('Ana autoriza 3 AULA a Bruno',await(await c.approve(bruno,unidades('3'))).wait());
  const antes=await observar('Bruno transfiere 2 AULA de Ana',await(await c.connect(b).transferFrom(ana,bruno,unidades('2'))).wait());
  let rechazado=false;
  try {await c.connect(b).transferFrom.estimateGas(ana,bruno,unidades('2'));} catch {rechazado=true;}
  if(!rechazado) throw Error('Debía rechazarse una transferencia superior al permiso restante.');
  const despues=await observar('Rechazo previo al envío: solicita 2, queda permiso 1');
  for(const campo of ['saldoAna','saldoBruno','permisoAnaParaBruno','ofertaTotal']) if(antes[campo]!==despues[campo]) throw Error('El rechazo no conservó el estado esperado.');
  const informe={chainId:Number((await p.getNetwork()).chainId),contrato:await c.getAddress(),ana,bruno,nombre:await c.name(),simbolo:await c.symbol(),decimals,registros,alcance:'Instancia nueva de TokenAula. La aprobación concede permiso, no distribuye tokens. El último rechazo ocurre al estimar, sin transacción enviada.'};
  await mkdir('resultados',{recursive:true});
  await writeFile('resultados/token-local.json',JSON.stringify(informe,null,2));
  console.table(registros);
  console.log('Informe: resultados/token-local.json. No modifica el registro del Contador.');
} finally {p.destroy();}
