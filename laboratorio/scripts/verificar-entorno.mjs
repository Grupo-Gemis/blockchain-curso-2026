import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const [major,minor]=process.versions.node.split('.').map(Number);
if(major<22||(major===22&&minor<13)){console.error('Se necesita Node.js 22.13 o superior. Se probó con Node.js 24.');process.exit(1);}
console.log('Node.js:',process.version,'| npm:',execFileSync(process.platform==='win32'?'npm.cmd':'npm',['--version'],{encoding:'utf8'}).trim());
for(const p of ['hardhat','ethers','@openzeppelin/contracts']){try{console.log(p,JSON.parse(readFileSync(`node_modules/${p}/package.json`)).version);}catch{console.error(`Falta ${p}. Ejecutá npm ci desde laboratorio.`);process.exitCode=1;}}
