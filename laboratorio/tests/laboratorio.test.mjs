import {test,after} from 'node:test';import assert from 'node:assert/strict';
import {parseEther,parseUnits} from 'ethers';import {local,desplegar,costoETH,presupuestoUso} from '../scripts/comun.mjs';import {enviarYConfirmar} from '../ui/cliente.js';
const p=await local(),a=await p.getSigner(0),b=await p.getSigner(1);after(()=>p.destroy());
test('Contador: estado, evento y permiso de reiniciar',async()=>{const c=await desplegar('Contador',a);assert.equal(await c.valor(),0n);const r=await(await c.connect(b).incrementar()).wait();assert.equal(c.interface.parseLog(r.logs[0]).args.nuevoValor,1n);await(await c.connect(b).incrementar()).wait();assert.equal(await c.valor(),2n);await assert.rejects(()=>c.connect(b).reiniciar());assert.equal(await c.valor(),2n);await(await c.reiniciar()).wait();assert.equal(await c.valor(),0n);});
test('ERC20: emisión, transferencia y aprobación acotada',async()=>{
  const ana=await a.getAddress(),bruno=await b.getAddress();
  const c=await desplegar('TokenAula',a,[ana]),supply=parseUnits('1000000',18);
  assert.equal(await c.decimals(),18n); assert.equal(await c.totalSupply(),supply);
  assert.equal(await c.balanceOf(ana),supply); assert.equal(await c.balanceOf(bruno),0n);
  await(await c.transfer(bruno,parseUnits('10',18))).wait();
  await(await c.approve(bruno,parseUnits('3',18))).wait();
  assert.equal(await c.balanceOf(bruno),parseUnits('10',18));
  assert.equal(await c.allowance(ana,bruno),parseUnits('3',18));
  await(await c.connect(b).transferFrom(ana,bruno,parseUnits('2',18))).wait();
  assert.equal(await c.allowance(ana,bruno),parseUnits('1',18));
  await assert.rejects(()=>c.connect(b).transferFrom(ana,bruno,parseUnits('2',18)));
  assert.equal(await c.balanceOf(ana),parseUnits('999988',18));
  assert.equal(await c.balanceOf(bruno),parseUnits('12',18));
  assert.equal(await c.totalSupply(),supply);
  assert.equal(await c.allowance(ana,bruno),parseUnits('1',18));
});
for(const [nombre,extraido,restante] of [['BovedaVulnerable','4','2'],['BovedaSegura','1','5']]) test(`${nombre}: receptor con reentrada controlada`,async()=>{
  const vault=await desplegar(nombre,a,[],'Bovedas');
  await(await vault.depositar({value:parseEther('5')})).wait();
  const receptor=await desplegar('ReceptorPrueba',b,[await vault.getAddress()],'Bovedas');
  await(await receptor.probar({value:parseEther('1')})).wait();
  const balance=async direccion=>BigInt(await p.send('eth_getBalance',[direccion,'latest']));
  assert.equal(await balance(await receptor.getAddress()),parseEther(extraido));
  assert.equal(await balance(await vault.getAddress()),parseEther(restante));
  assert.equal(await vault.saldos(await receptor.getAddress()),0n);
  assert.equal(await vault.saldos(await a.getAddress()),parseEther('5'));
});
test('BovedaSegura: un envío fallido conserva el crédito y permite reintentar',async()=>{
  const vault=await desplegar('BovedaSegura',a,[],'Bovedas');
  await(await vault.depositar({value:parseEther('5')})).wait();
  const receptor=await desplegar('ReceptorRechaza',b,[await vault.getAddress()],'Bovedas');
  await(await receptor.depositar({value:parseEther('1')})).wait();
  await assert.rejects(async()=>{const tx=await receptor.retirar({gasLimit:200000n});await tx.wait();},/Fallo envio|execution reverted/);
  assert.equal(await vault.saldos(await receptor.getAddress()),parseEther('1'));
  assert.equal(BigInt(await p.send('eth_getBalance',[await vault.getAddress(),'latest'])),parseEther('6'));
  await(await receptor.aceptar()).wait();
  await(await receptor.retirar({gasLimit:200000n})).wait();
  assert.equal(await vault.saldos(await receptor.getAddress()),0n);
  assert.equal(await vault.saldos(await a.getAddress()),parseEther('5'));
  assert.equal(BigInt(await p.send('eth_getBalance',[await vault.getAddress(),'latest'])),parseEther('5'));
});
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
test('Interfaz: espera el recibo y lo devuelve sin anticipar éxito', async () => {
  const estados = []
  let resolverRecibo, avisarEspera
  const reciboPendiente = new Promise(resolve => { resolverRecibo = resolve })
  const esperaIniciada = new Promise(resolve => { avisarEspera = resolve })
  const recibo = {status: 1, hash: '0x-prueba'}
  const resultado = enviarYConfirmar(async () => ({
    hash: '0x-prueba',
    wait: () => { avisarEspera(); return reciboPendiente }
  }), s => estados.push(s))
  await esperaIniciada
  assert.equal(estados.length, 2)
  assert.match(estados[0], /firma|solicitud/i)
  assert.match(estados[1], /Pendiente.*0x-prueba/)
  assert.ok(!estados.some(s => /Confirmada/.test(s)))
  resolverRecibo(recibo)
  assert.equal(await resultado, recibo)
  assert.equal(estados.length, 3)
  assert.match(estados[2], /Confirmada.*0x-prueba/)
})
for (const [nombre, recibo] of [['status fallido', {status: 0}], ['recibo ausente', null]]) {
  test('Interfaz: rechaza ' + nombre + ' sin anunciar confirmación', async () => {
    const estados = []
    await assert.rejects(() => enviarYConfirmar(async () => ({
      hash: '0x-prueba', wait: async () => recibo
    }), s => estados.push(s)))
    assert.ok(!estados.some(s => /Confirmada/.test(s)))
  })
}
test('Interfaz: propaga errores de la espera', async () => {
  const estados = [], error = new Error('Fallo de espera de recibo')
  await assert.rejects(() => enviarYConfirmar(async () => ({
    hash: '0x-prueba', wait: async () => { throw error }
  }), s => estados.push(s)), e => e === error)
  assert.equal(estados.length, 2)
  assert.ok(!estados.some(s => /Confirmada/.test(s)))
})
test('Interfaz: una firma rechazada no produce un envío pendiente', async () => {
  const estados = [], error = new Error('Firma cancelada por la persona')
  await assert.rejects(() => enviarYConfirmar(async () => { throw error }, s => estados.push(s)), e => e === error)
  assert.equal(estados.length, 1)
  assert.ok(!estados.some(s => /Pendiente|Confirmada/.test(s)))
})

test('Costos: patrocinio, frecuencia y equilibrio conservan las unidades',()=>{
  const entradas={usuarios:100,operaciones:20,gas:50000,precioGwei:2,ethUSD:2000,abono:5,fijos:100,patrocinio:1};
  const base=presupuestoUso(entradas);
  assert.equal(base.comisionUSD,0.2); assert.equal(base.gasTotal,400);
  assert.equal(base.resultado,0); assert.equal(base.costoUsuario,5); assert.equal(base.equilibrio,100);
  const usuario=presupuestoUso({...entradas,patrocinio:0});
  assert.equal(usuario.gasTotal,400); assert.equal(usuario.resultado,400); assert.equal(usuario.costoUsuario,9);
  const intensivo=presupuestoUso({...entradas,operaciones:40});
  assert.equal(intensivo.resultado,-400); assert.equal(intensivo.contribucion,-3); assert.equal(intensivo.equilibrio,null);
  assert.equal(presupuestoUso({...entradas,usuarios:0}).resultado,-100);
  assert.throws(()=>presupuestoUso({...entradas,usuarios:1.5}));
  assert.throws(()=>presupuestoUso({...entradas,precioGwei:NaN}));
});
