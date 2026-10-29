import test from 'node:test'
import assert from 'node:assert/strict'
import {eth, NODOS, QUORUM, BASE_INICIAL, GAS_BLOQUE, hash, sign, copy, blockBody, genesis,
  initialAccounts, nextBaseFee, proposerFor, effectiveTip, selectByTip, buildBlock, checkBlock, replay} from '../modelo.mjs'
import {createClassroom} from '../servidor.mjs'

const wallets = Array.from({length:NODOS},() => eth.Wallet.createRandom())
const participants = wallets.map((wallet,i) => ({slot:i+1,address:wallet.address,name:'Equipo ' + (i+1)}))
async function transaction(from, options = {}) {
  const body = {chainId:'utn-aula-10',from,to:from,nonce:0,value:'0',gasLimit:21000,
    maxFeePerGas:eth.parseUnits('100',9).toString(),maxPriorityFeePerGas:eth.parseUnits('2',9).toString(),...options}
  const tx = {body,signature:await sign(wallets[from-1],body)}
  return {...tx,id:hash(tx)}
}
const context = () => ({seed:'aula-prueba',slot:1,participants,accounts:initialAccounts(),parent:genesis('aula-prueba',participants)})
async function signedBlock(ctx, transactions = []) {
  const block = buildBlock({...ctx,transactions})
  block.signature = await sign(wallets[block.proposer-1],{hash:block.hash})
  return block
}
async function ballot(block,voter,approve=true) {
  const payload = {slot:block.slot,blockHash:block.hash,approve,voter}
  return {voter,approve,signature:await sign(wallets[voter-1],payload)}
}

test('Rotación: cada ciclo de diez turnos asigna las diez identidades una sola vez', () => {
  for (const start of [1,11,21]) assert.equal(new Set(Array.from({length:10},(_,i)=>proposerFor('semilla',start+i))).size,10)
})
test('Tarifa base: bloques lleno, objetivo, vacío, mínimo de un wei y divisiones enteras', () => {
  const parent = {baseFeePerGas:BASE_INICIAL,gasLimit:GAS_BLOQUE,gasUsed:GAS_BLOQUE}
  assert.equal(nextBaseFee(parent),'22500000000')
  assert.equal(nextBaseFee({...parent,gasUsed:31500}),BASE_INICIAL)
  assert.equal(nextBaseFee({...parent,gasUsed:0}),'17500000000')
  assert.equal(nextBaseFee({...parent,baseFeePerGas:'1',gasUsed:31501}),'2')
  assert.equal(nextBaseFee({...parent,baseFeePerGas:'17',gasUsed:21000}),'17')
})
test('Puja: la propina efectiva decide el orden del criterio codicioso y el máximo puede recortarla', async () => {
  const low = await transaction(1,{maxFeePerGas:eth.parseUnits('100',9).toString(),maxPriorityFeePerGas:eth.parseUnits('1',9).toString()})
  const clipped = await transaction(2,{maxFeePerGas:eth.parseUnits('22',9).toString(),maxPriorityFeePerGas:eth.parseUnits('5',9).toString()})
  const excluded = await transaction(3,{maxFeePerGas:eth.parseUnits('19',9).toString()})
  assert.equal(effectiveTip(clipped.body,BASE_INICIAL),2000000000n)
  assert.equal(effectiveTip(excluded.body,BASE_INICIAL),null)
  assert.deepEqual(selectByTip([low,clipped,excluded],context()).map(t => t.body.from),[2,1])
})
test('Capacidad y nonces: no se adelanta un nonce futuro y solo caben tres transferencias', async () => {
  const first = await transaction(1,{maxPriorityFeePerGas:'1000000000'})
  const future = await transaction(1,{nonce:1,maxPriorityFeePerGas:'9000000000'})
  const others = await Promise.all([2,3,4].map(id => transaction(id)))
  assert.deepEqual(selectByTip([future,...others],context()).map(t => t.body.from),[2,3,4])
  const selected = selectByTip([future,first],context())
  assert.deepEqual(selected.map(t => t.body.nonce),[0,1])
  assert.throws(() => buildBlock({...context(),transactions:[first,...others]}),/gas disponible/)
})
test('Ejecución: conserva el valor, distribuye propinas y reduce la oferta exactamente por la base quemada', async () => {
  const ctx = context(), tx = await transaction(1,{to:2,value:eth.parseEther('0.01').toString()})
  const block = await signedBlock(ctx,[tx]), result = checkBlock(block,ctx)
  const before = Object.values(ctx.accounts).reduce((sum,a) => sum+BigInt(a.balance),0n)
  const after = Object.values(result.accounts).reduce((sum,a) => sum+BigInt(a.balance),0n)
  assert.equal(before-after,21000n*BigInt(BASE_INICIAL))
  assert.equal(result.receipts[0].fee, String(21000n*22000000000n))
  assert.equal(result.tips,String(21000n*2000000000n))
  assert.equal(result.accounts[1].nonce,1)
})
test('Comprobación independiente: rechaza estado alterado, firma falsa, otra red y certificado repetido', async () => {
  const ctx = context(), block = await signedBlock(ctx,[await transaction(1)])
  const corrupt = {...copy(block),stateRoot:'0x'+'0'.repeat(64)}
  corrupt.hash=hash(blockBody(corrupt))
  corrupt.signature=await sign(wallets[corrupt.proposer-1],{hash:corrupt.hash})
  assert.throws(() => checkBlock(corrupt,ctx),/ejecución independiente/)
  assert.throws(() => checkBlock({...block,signature:'0x1234'},ctx),/Firma de propuesta/)
  const wrong = await transaction(2,{chainId:'otra-red'})
  assert.throws(() => buildBlock({...ctx,transactions:[wrong]}),/red incorrecto/)
  const vote=await ballot(block,1)
  assert.throws(() => replay([ctx.parent,{...block,certificate:Array(7).fill(vote)}],participants,ctx.seed),/duplicado/)
})
test('Inanición observable: tras tres bloques llenos sigue pendiente la operación con propina baja', async () => {
  let ctx=context()
  const low = await transaction(10,{maxPriorityFeePerGas:'100000000'})
  let pending=[low,...await Promise.all(Array.from({length:9},(_,i) => transaction(i+1,{maxPriorityFeePerGas:'3000000000'})))]
  for(let round=0;round<3;round++) {
    const chosen=selectByTip(pending,ctx)
    assert.equal(chosen.length,3)
    assert.ok(chosen.every(t => t.body.from !== 10))
    const block=await signedBlock(ctx,chosen), result=checkBlock(block,ctx)
    pending=pending.filter(t => !chosen.some(c => c.id===t.id))
    ctx={...ctx,parent:block,accounts:result.accounts,slot:ctx.slot+1}
  }
  assert.equal(pending.length,1)
  assert.equal(pending[0].id,low.id)
  assert.equal(ctx.accounts[10].nonce,0)
})

test('Aula completa: diez identidades, difusión, siete votos, finalidad, propuesta inválida y evidencia sin claves', async () => {
  const classroom=createClassroom({teacherKey:'acceso-docente-de-prueba',pin:'123456',seed:'aula-prueba'})
  await new Promise(resolve => classroom.server.listen(0,'127.0.0.1',resolve))
  const url='http://127.0.0.1:'+classroom.server.address().port
  const tokens={}
  async function request(route,input,slot,teacher=false) {
    const response=await fetch(url+'/api/'+route,{method:input?'POST':'GET',headers:{'Content-Type':'application/json',
      ...(slot ? {'x-participant-token':tokens[slot]}:{}),...(teacher?{'x-teacher-key':classroom.teacherKey}:{})},
      ...(input?{body:JSON.stringify(input)}:{})})
    const data=await response.json()
    if(!response.ok) throw Error(data.error)
    return data
  }
  try {
    let state=await request('state')
    await assert.rejects(request('teacher',{action:'start'},null,true),/10 identidades/)
    await assert.rejects(request('join',{pin:'000000',slot:1}),/Código/)
    for(const p of participants) {
      const payload={sessionId:state.sessionId,slot:p.slot,name:p.name}
      const joined=await request('join',{...payload,pin:'123456',address:p.address,signature:await sign(wallets[p.slot-1],payload)})
      tokens[p.slot]=joined.token
    }
    await assert.rejects(request('join',{pin:'123456',slot:1}),/ocupada/)
    state=await request('teacher',{action:'start'},null,true)
    const tx=await transaction(1)
    await assert.rejects(request('transaction',{transaction:{...tx,signature:'0x1234'}},1),/Firma/)
    state=await request('transaction',{transaction:tx},1)
    const replacement=await transaction(1,{maxFeePerGas:eth.parseUnits('110',9).toString(),maxPriorityFeePerGas:eth.parseUnits('2.2',9).toString()})
    state=await request('transaction',{transaction:replacement},1)
    assert.equal(state.pending.length,1)
    assert.equal(state.pending[0].id,replacement.id)
    const block=await signedBlock({seed:state.seed,slot:state.slot,participants:state.participants,accounts:state.accounts,parent:state.chain.at(-1)},state.pending)
    state=await request('propose',{block},state.proposer)
    await assert.rejects(request('transaction',{transaction:tx},1),/votación/)
    assert.equal((await request('state')).pending[0].id,replacement.id)
    for(let id=1;id<=6;id++) state=await request('vote',{vote:await ballot(block,id)},id)
    assert.equal(state.chain.length,1)
    await assert.rejects(request('vote',{vote:await ballot(block,1)},1),/solo voto/)
    state=await request('vote',{vote:await ballot(block,7)},7)
    assert.equal(state.chain.length,2)
    assert.equal(state.finalizedHeight,0)
    assert.equal(state.pending.length,0)
    const accountsBeforeExtraVote=hash(state.accounts)
    state=await request('vote',{vote:await ballot(block,8)},8)
    assert.equal(state.chain.at(-1).certificate.length,8)
    assert.equal(hash(state.accounts),accountsBeforeExtraVote)
    // Cada uno de los diez nodos reconstruye su copia con las siete firmas.
    const copies=Array.from({length:NODOS},() => replay(copy(state.chain),state.participants,state.seed))
    assert.ok(copies.every(accounts => hash(accounts)===state.chain.at(-1).stateRoot))
    state=await request('teacher',{action:'next'},null,true)
    const successor=await signedBlock({seed:state.seed,slot:state.slot,participants:state.participants,accounts:state.accounts,parent:state.chain.at(-1)})
    state=await request('propose',{block:successor},state.proposer)
    for(let id=1;id<=QUORUM;id++) state=await request('vote',{vote:await ballot(successor,id)},id)
    assert.equal(state.finalizedHeight,1)
    state=await request('teacher',{action:'next'},null,true)
    const bad=await signedBlock({seed:state.seed,slot:state.slot,participants:state.participants,accounts:state.accounts,parent:state.chain.at(-1)})
    bad.stateRoot='0x'+'0'.repeat(64)
    bad.hash=hash(blockBody(bad))
    bad.signature=await sign(wallets[bad.proposer-1],{hash:bad.hash})
    state=await request('propose',{block:bad},state.proposer)
    await assert.rejects(request('vote',{vote:await ballot(bad,1)},1),/ejecución independiente/)
    state=await request('vote',{vote:await ballot(bad,1,false)},1)
    assert.equal(state.votes.filter(v=>v.approve).length,0)
    state=await request('teacher',{action:'next'},null,true)
    assert.equal(state.chain.length,3)
    assert.equal(state.rounds.at(-1).committed,false)
    const evidence=JSON.stringify(await request('export'))
    assert.ok(!evidence.includes(classroom.teacherKey))
    assert.ok(!evidence.includes(tokens[1]))
    assert.ok(!evidence.includes(wallets[0].privateKey))
    assert.equal((await fetch(url+'/servidor.mjs')).status,404)
  } finally {await classroom.close()}
})
