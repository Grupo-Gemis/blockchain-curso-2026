import {JsonRpcProvider,Wallet,ContractFactory,Contract,formatEther,keccak256} from 'ethers';
import {mkdir,writeFile} from 'node:fs/promises';
import {artefacto} from './comun.mjs';
const modos=process.argv.slice(2);
if(modos.length>1 || (modos.length && !['--check','--desplegar'].includes(modos[0]))) throw Error('Usá --check o --desplegar.');
const url=process.env.SEPOLIA_RPC_URL,key=process.env.SEPOLIA_PRIVATE_KEY;
if(!url||url.includes('REEMPLAZAR')||!key)throw Error('Completá .env con un proveedor y una cuenta dedicada de Sepolia.');
const p=new JsonRpcProvider(url);
try {
 if((await p.getNetwork()).chainId!==11155111n)throw Error('Se requiere Sepolia (11155111).');
 const w=new Wallet(key,p),a=await artefacto('Contador');
 console.log('Red: Sepolia | Cuenta pública:',w.address,'| Saldo de prueba:',formatEther(await p.getBalance(w.address)));
 const f=new ContractFactory(a.abi,a.bytecode,w),solicitud=await f.getDeployTransaction();
 console.log('Gas estimado:',(await w.estimateGas(solicitud)).toString());
 if(modos[0]==='--desplegar') {
  const c=await f.deploy(); await c.waitForDeployment();
  const r=await c.deploymentTransaction().wait(),direccion=await c.getAddress();
  if(!r || r.status!==1 || r.contractAddress!==direccion)throw Error('No se confirmó la creación esperada.');
  const codigo=await p.getCode(direccion);
  if(codigo==='0x')throw Error('No se encontró código.');
  const lectura=new Contract(direccion,a.abi,p),propietario=await lectura.propietario();
  if(propietario.toLowerCase()!==w.address.toLowerCase())throw Error('El propietario no coincide.');
  const registro={red:'Sepolia',chainId:11155111,contrato:direccion,hash:r.hash,bloque:r.blockNumber,status:r.status,creador:w.address,propietario,valor:(await lectura.valor()).toString(),gasUsed:r.gasUsed.toString(),comisionETH:formatEther(r.gasUsed*r.gasPrice),runtimeCodeHash:keccak256(codigo),constructor:[],alcance:'Creación del Contador sin argumentos. No acredita auditoría ni verificación de fuente en explorador.'};
  await mkdir('resultados',{recursive:true});
  await writeFile('resultados/deployment-sepolia.json',JSON.stringify(registro,null,2));
  console.log('Contrato:',direccion,'| Transacción:',r.hash);
  console.log('Registro público: resultados/deployment-sepolia.json. No modifica el registro local de la DApp.');
 } else console.log('Comprobación terminada, sin envío. Para desplegar: npm run sepolia -- --desplegar');
} catch {
 console.error('No se completó la operación. Revisá red, saldo de prueba y configuración. Se omiten detalles del proveedor para proteger credenciales.');
 process.exitCode=1;
} finally {p.destroy();}
