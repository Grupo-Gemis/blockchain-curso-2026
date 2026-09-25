import {test,after} from 'node:test';import assert from 'node:assert/strict';
import {parseEther,parseUnits} from 'ethers';import {local,desplegar,costoETH} from '../scripts/comun.mjs';import {enviarYConfirmar} from '../ui/cliente.js';
const p=await local(),a=await p.getSigner(0),b=await p.getSigner(1);after(()=>p.destroy());
test('Contador: estado, evento y permiso de reiniciar',async()=>{const c=await desplegar('Contador',a);assert.equal(await c.valor(),0n);const r=await(await c.connect(b).incrementar()).wait();assert.equal(c.interface.parseLog(r.logs[0]).args.nuevoValor,1n);await(await c.connect(b).incrementar()).wait();assert.equal(await c.valor(),2n);await assert.rejects(()=>c.connect(b).reiniciar());assert.equal(await c.valor(),2n);await(await c.reiniciar()).wait();assert.equal(await c.valor(),0n);});
test('ERC20: emisión, transferencia y aprobación acotada',async()=>{const c=await desplegar('TokenAula',a,[await a.getAddress()]);const supply=parseUnits('1000000',18);assert.equal(await c.decimals(),18n);assert.equal(await c.totalSupply(),supply);await(await c.transfer(await b.getAddress(),parseUnits('10',18))).wait();assert.equal(await c.balanceOf(await b.getAddress()),parseUnits('10',18));assert.equal(await c.totalSupply(),supply);await(await c.approve(await b.getAddress(),3n)).wait();await(await c.connect(b).transferFrom(await a.getAddress(),await b.getAddress(),2n)).wait();assert.equal(await c.allowance(await a.getAddress(),await b.getAddress()),1n);await assert.rejects(async()=>c.connect(b).transferFrom(await a.getAddress(),await b.getAddress(),2n));});
for(const [nombre,extraido] of [['BovedaVulnerable','4'],['BovedaSegura','1']])test(`${nombre}: receptor con reentrada controlada`,async()=>{const vault=await desplegar(nombre,a,[],'Bovedas');await(await vault.depositar({value:parseEther('5')})).wait();const receptor=await desplegar('ReceptorPrueba',b,[await vault.getAddress()],'Bovedas');await(await receptor.probar({value:parseEther('1')})).wait();const saldo=BigInt(await p.send('eth_getBalance',[await receptor.getAddress(),'latest']));assert.equal(saldo,parseEther(extraido));assert.equal(await vault.saldos(await receptor.getAddress()),0n);});
test('Costos: unidades y costo por usuario',()=>{assert.equal(costoETH(50000,22),0.0011);assert.equal(costoETH(80000,30),0.0024);assert.equal(costoETH(50000,2)*2000*20*100,400);assert.throws(()=>costoETH(-1,22));});
test('Interfaz: no informa éxito antes de un recibo válido',async()=>{const estados=[];await enviarYConfirmar(async()=>({hash:'demo',wait:async()=>({status:1,hash:'demo'})}),s=>estados.push(s));assert.equal(estados.length,3);assert.match(estados[1],/Pendiente/);assert.match(estados[2],/Confirmada/);await assert.rejects(()=>enviarYConfirmar(async()=>({hash:'demo',wait:async()=>({status:0})}),()=>{}));await assert.rejects(()=>enviarYConfirmar(async()=>{throw Error('Firma rechazada');},()=>{}));});


// La evidencia del deployment debe rechazar registros que apuntan a otra instancia.
import {artefacto} from '../scripts/comun.mjs';
import {verificarDeployment} from '../scripts/verificar-deployment.mjs';
test('Deployment: creación, lectura y rechazo de un registro cruzado', async()=>{
 const c=await desplegar('Contador',a);
 const registro={chainId:31337,contador:await c.getAddress(),contadorTransactionHash:c.deploymentTransaction().hash};
 const artifact=await artefacto('Contador');
 const evidencia=await verificarDeployment(p,registro,artifact);
 assert.equal(evidencia.status,1);
 assert.equal(evidencia.valor,'0');
 assert.equal(evidencia.propietario,await a.getAddress());
 await assert.rejects(()=>verificarDeployment(p,{...registro,chainId:1},artifact),/red/);
 const otro=await desplegar('Contador',b);
 const otraDireccion=await otro.getAddress();
 await assert.rejects(()=>verificarDeployment(p,{...registro,contador:otraDireccion},artifact),/receipt/);
 await assert.rejects(()=>verificarDeployment(p,registro,{...artifact,bytecode:'0x00'}),/bytecode/);
});
