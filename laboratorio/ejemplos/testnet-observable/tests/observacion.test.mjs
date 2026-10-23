import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {JsonRpcProvider,ContractFactory} from 'ethers'
import {comprobarRed,resumenRecibo,observar,comparar,historia} from '../ui/observacion.js'

test('Recorrido real local: creación, gas, dos actores, reversión e historia conservada',async()=>{
  const p=new JsonRpcProvider(process.env.TESTNET_ENSAYO_RPC,undefined,{cacheTimeout:-1})
  try {
    comprobarRed((await p.getNetwork()).chainId,31337)
    const ana=await p.getSigner(0),bruno=await p.getSigner(1)
    const artifact=JSON.parse(await readFile('artifacts/contracts/Contador.sol/Contador.json','utf8'))
    const c=await new ContractFactory(artifact.abi,artifact.bytecode,ana).deploy(),creacion=await c.deploymentTransaction().wait()
    assert.equal(creacion.status,1);assert.equal(await c.valor(),0n);assert.equal(await c.propietario(),await ana.getAddress())
    const uno=await (await c.connect(bruno).incrementar()).wait()
    const dos=await (await c.incrementar()).wait()
    assert.equal(await c.valor(),2n)
    const saldoAntes=await p.getBalance(await bruno.getAddress())
    const fallida=await c.connect(bruno).reiniciar({gasLimit:100000})
    let recibo
    await assert.rejects(fallida.wait(),error=>{recibo=error.receipt;return error.code==='CALL_EXCEPTION'&&recibo?.status===0})
    assert.equal(await c.valor(),2n)
    const saldoDespues=await p.getBalance(await bruno.getAddress())
    assert.equal(saldoAntes-saldoDespues,recibo.gasUsed*recibo.gasPrice)
    assert.equal(recibo.logs.length,0)
    const cero=await(await c.reiniciar()).wait();assert.equal(await c.valor(),0n)
    const h=await historia(c,creacion.blockNumber,await p.getBlockNumber())
    assert.equal(h.parcial,false);assert.deepEqual(h.eventos.map(e=>e.valor),['1','2','0'])
    assert.equal(h.eventos[0].autor,await bruno.getAddress())
    assert.equal(await c.valor({blockTag:uno.blockNumber}),1n)
    assert.equal(await c.valor({blockTag:dos.blockNumber}),2n)
    assert.equal(await c.valor({blockTag:cero.blockNumber}),0n)
    const r=await observar(p,fallida.hash,31337)
    assert.equal(r.status,0);assert.equal(r.canonico,true);assert.ok(r.confirmaciones>=2)
    assert.equal(r.comisionWei,(recibo.gasUsed*recibo.gasPrice).toString())
    assert.match(r.finalidad,/No se evalúa PoS/)
    assert.equal((await comparar(p,p,fallida.hash,31337)).coinciden,true)
  } finally {p.destroy()}
})
test('Una red equivocada se rechaza antes de consultar o enviar',async()=>{
  assert.throws(()=>comprobarRed(1,11155111));assert.throws(()=>comprobarRed(31337,11155111))
  let consulto=false
  await assert.rejects(observar({getNetwork:async()=>({chainId:1n}),getTransactionReceipt:async()=>{consulto=true}},'0x00',11155111))
  assert.equal(consulto,false)
})
test('Finalización modelada: éxito, bloque canónico y finalized son hitos distintos',()=>{
  const recibo={hash:'0xaa',blockHash:'0xbb',blockNumber:10,status:1,gasUsed:50000n,gasPrice:22000000000n}
  const tx={gasLimit:80000n,maxFeePerGas:30000000000n,maxPriorityFeePerGas:2000000000n,value:0n}
  const bloque={hash:'0xbb',baseFeePerGas:20000000000n}
  const r=resumenRecibo(recibo,tx,bloque,12,{number:9})
  assert.equal(r.comisionWei,'1100000000000000');assert.equal(r.confirmaciones,3)
  assert.equal(r.propinaWeiPorGas,'2000000000');assert.equal(r.finalidad,'Esperando finalización')
  assert.equal(resumenRecibo(recibo,tx,bloque,12,{number:10}).finalidad,'Bloque finalizado')
  assert.equal(resumenRecibo(recibo,tx,bloque,12,null).finalidad,'Finalización no disponible')
  const reorg=resumenRecibo(recibo,tx,{hash:'0xcc'},12,{number:12})
  assert.equal(reorg.canonico,false);assert.equal(reorg.confirmaciones,0);assert.notEqual(reorg.finalidad,'Bloque finalizado')
})
test('Sin recibo observado no se inventa inclusión ni comisión',async()=>{
  const r=await observar({getNetwork:async()=>({chainId:11155111n}),getTransactionReceipt:async()=>null},'0xaa',11155111)
  assert.equal(r.pendiente,true);assert.equal(r.comisionWei,undefined)
})
test('Contraste modelado: no coincidencia ante red cruzada o bloque diferente',async()=>{
  const r={blockHash:'a',blockNumber:4,status:1,gasUsed:2n}
  const p={getNetwork:async()=>({chainId:11155111n}),getTransactionReceipt:async()=>r,getBlock:async()=>({hash:'a'})}
  assert.equal((await comparar(p,{...p,getBlock:async()=>({hash:'b'})},'x',11155111)).coinciden,false)
  await assert.rejects(comparar(p,{...p,getNetwork:async()=>({chainId:1n})},'x',11155111))
  assert.equal((await comparar(p,{...p,getTransactionReceipt:async()=>null},'x',11155111)).coinciden,false)
})
test('Una historia limitada informa su rango y nunca lo presenta como completo',async()=>{
  const rangos=[],c={filters:{ValorCambiado:()=>0},queryFilter:async(_,a,b)=>{rangos.push([a,b]);return []}}
  const h=await historia(c,1,6000)
  assert.equal(h.parcial,true);assert.equal(h.desde,1001);assert.equal(h.hasta,6000)
  assert.equal(rangos.length,10);assert.deepEqual(rangos[0],[1001,1500]);assert.deepEqual(rangos.at(-1),[5501,6000])
})
