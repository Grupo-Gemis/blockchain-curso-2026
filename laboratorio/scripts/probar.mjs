import {spawn} from 'node:child_process';
import {setTimeout} from 'node:timers/promises';
const url='http://127.0.0.1:18545';
const child=spawn(process.execPath,['node_modules/hardhat/dist/src/cli.js','node','--network','hardhatMainnet','--hostname','127.0.0.1','--port','18545'],{stdio:['ignore','ignore','pipe']});let fallo='';child.stderr.on('data',b=>fallo+=b.toString());
try{let listo=false;for(let i=0;i<100;i++){if(child.exitCode!==null)throw Error('No se pudo iniciar el nodo de pruebas: '+fallo);await setTimeout(100);try{const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'eth_chainId',params:[]})});listo=(await r.json()).result==='0x7a69';if(listo)break;}catch{}}
if(!listo)throw Error('No respondió el nodo de pruebas.');const test=spawn(process.execPath,['--test',...(process.argv[2]?['--test-name-pattern='+process.argv[2]]:[]),'tests/laboratorio.test.mjs'],{stdio:'inherit',env:{...process.env,LAB_RPC_URL:url}});const code=await new Promise(resolve=>test.on('exit',resolve));process.exitCode=code??1;
}finally{child.kill('SIGTERM');await new Promise(resolve=>{if(child.exitCode!==null)resolve();else child.once('exit',resolve);});}
