import {JsonRpcProvider,Wallet,ContractFactory,formatEther} from 'ethers';
import {artefacto} from './comun.mjs';
const url=process.env.SEPOLIA_RPC_URL,key=process.env.SEPOLIA_PRIVATE_KEY;
if(!url||url.includes('REEMPLAZAR')||!key)throw Error('Completá .env con un proveedor y una cuenta dedicada de Sepolia.');
const p=new JsonRpcProvider(url);
try{if((await p.getNetwork()).chainId!==11155111n)throw Error('Red incorrecta: se requiere Sepolia (11155111).');
const w=new Wallet(key,p),a=await artefacto('Contador');console.log('Red: Sepolia | Cuenta pública:',w.address,'| Saldo de prueba:',formatEther(await p.getBalance(w.address)));
const f=new ContractFactory(a.abi,a.bytecode,w);const solicitud=await f.getDeployTransaction();console.log('Gas estimado:',(await w.estimateGas(solicitud)).toString());
if(process.argv.includes('--desplegar')){const c=await f.deploy();await c.waitForDeployment();console.log('Contrato:',await c.getAddress(),'| Transacción:',c.deploymentTransaction().hash);}else{console.log('Verificación terminada, sin envío. Para desplegar: npm run sepolia -- --desplegar');}
}catch(e){console.error('No se completó la operación. Revisá red, saldo de prueba y configuración del proveedor. Los detalles del proveedor se omiten para proteger credenciales.');process.exitCode=1;}finally{p.destroy();}
