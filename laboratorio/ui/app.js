import {JsonRpcProvider,BrowserProvider,Contract} from '/vendor/ethers.js';
import {enviarYConfirmar} from './cliente.js';
const $=id=>document.getElementById(id),estado=t=>$('estado').textContent=t;
let contrato,proveedor;
function invalidar(){contrato=undefined;habilitar(false);$('valor').textContent='—';$('red').textContent='Reconexión necesaria';}
function habilitar(si){for(const id of ['leer','sumar','reset'])$(id).disabled=!si;}
async function leer(){$('valor').textContent=(await contrato.valor()).toString();}
async function conectar(wallet){invalidar();try{proveedor?.destroy();proveedor=undefined;contrato=undefined;const response=await fetch('/despliegue.json');if(!response.ok)throw Error('Primero ejecutá npm run desplegar.');const config=await response.json();
if(wallet&&!window.ethereum)throw Error('No hay wallet disponible en este navegador. Podés usar las cuentas locales.');
proveedor=wallet?new BrowserProvider(window.ethereum):new JsonRpcProvider('http://127.0.0.1:8545');if(wallet)await proveedor.send('eth_requestAccounts',[]);
const red=await proveedor.getNetwork();if(red.chainId!==31337n)throw Error('Seleccioná la red local 31337.');if(await proveedor.getCode(config.contador)==='0x')throw Error('No existe el contrato en esta red. Volvé a desplegarlo.');const signer=await proveedor.getSigner(wallet?undefined:Number($('cuenta').value));contrato=new Contract(config.contador,config.abi,signer);$('red').textContent=`Red ${red.chainId} · Contrato ${config.contador} · Cuenta ${await signer.getAddress()}`;await leer();habilitar(true);estado('Conexión lista.');}catch(e){estado(e.shortMessage||e.message);}}
$('local').onclick=()=>conectar(false);$('wallet').onclick=()=>conectar(true);$('cuenta').onchange=()=>{invalidar();estado('Reconectá con la cuenta seleccionada.');};
$('leer').onclick=()=>leer().catch(e=>estado(e.shortMessage||e.message));
for(const [id,metodo] of [['sumar','incrementar'],['reset','reiniciar']])$(id).onclick=async()=>{habilitar(false);try{await enviarYConfirmar(()=>contrato[metodo](),estado);await leer();}catch(e){estado(`Operación rechazada o fallida: ${e.shortMessage||e.message}`);}finally{habilitar(Boolean(contrato));}};
window.ethereum?.on?.('accountsChanged',()=>{invalidar();estado('Cambió la cuenta. Reconectá la wallet.');});window.ethereum?.on?.('chainChanged',()=>{invalidar();estado('Cambió la red. Reconectá la wallet.');});
