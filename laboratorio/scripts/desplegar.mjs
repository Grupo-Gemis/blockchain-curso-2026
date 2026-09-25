import {mkdir,writeFile} from 'node:fs/promises';
import {local,desplegar,artefacto} from './comun.mjs';
const p=await local();try {const signer=await p.getSigner(0);const c=await desplegar('Contador',signer);const t=await desplegar('TokenAula',signer,[await signer.getAddress()]);
const data={chainId:31337,contador:await c.getAddress(),token:await t.getAddress(),abi:(await artefacto('Contador')).abi};await mkdir('ui',{recursive:true});await writeFile('ui/despliegue.json',JSON.stringify(data,null,2));console.log('Instancias locales:',data.contador,data.token,'| ui/despliegue.json actualizado');}finally{p.destroy();}
