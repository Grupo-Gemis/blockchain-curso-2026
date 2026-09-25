import {spawn} from 'node:child_process';import {setTimeout} from 'node:timers/promises';
const procesos=[];function iniciar(args,stdio='inherit'){const p=spawn(process.execPath,args,{stdio});procesos.push(p);return p;}
function cerrar(){for(const p of procesos)if(p.exitCode===null)p.kill('SIGTERM');}
process.on('SIGINT',()=>{cerrar();process.exit(0);});process.on('SIGTERM',()=>{cerrar();process.exit(0);});
try{const nodo=iniciar(['node_modules/hardhat/dist/src/cli.js','node','--network','hardhatMainnet','--hostname','127.0.0.1'],'ignore');let listo=false;
for(let i=0;i<100;i++){await setTimeout(100);if(nodo.exitCode!==null)throw Error('No se pudo iniciar el nodo. Comprobá que el puerto 8545 esté libre.');try{const r=await fetch('http://127.0.0.1:8545',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'eth_chainId',params:[]})});if((await r.json()).result==='0x7a69'){listo=true;break;}}catch{}}
if(!listo)throw Error('El nodo no respondió.');const despliegue=iniciar(['scripts/desplegar.mjs']);const code=await new Promise(resolve=>despliegue.once('exit',resolve));if(code!==0)throw Error('No se pudo desplegar.');const ui=iniciar(['scripts/interfaz.mjs']);console.log('Demostración local. Ctrl+C cierra la interfaz y el nodo.');await new Promise(resolve=>ui.once('exit',resolve));
}finally{cerrar();}
