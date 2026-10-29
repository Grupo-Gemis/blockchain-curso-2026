import test from 'node:test'
import assert from 'node:assert/strict'
import {configuration,initialAccounts,proposerFor,eth,sign,hash,replay,buildBlock} from '../modelo.mjs'
import {createClassroom} from '../servidor.mjs'

test('Tamaño, quórum estricto, saldos y rotación para cursos distintos',()=>{
  for(const count of [2,3,4,6,10,17,20,60]) {
    const config=configuration(count)
    assert.ok(config.quorum>2*count/3)
    assert.ok(config.quorum-1<=2*count/3)
    assert.equal(Object.keys(initialAccounts(count)).length,count)
    for(const cycle of [0,1]) {
      const proposers=Array.from({length:count},(_,i)=>proposerFor('otra-cursada',cycle*count+i+1,count))
      assert.deepEqual(proposers.sort((a,b)=>a-b),Array.from({length:count},(_,i)=>i+1))
    }
  }
  for(const invalid of [0,1,61,2.5,NaN,'10']) assert.throws(()=>configuration(invalid),/entre 2 y 60/)
  assert.equal(configuration(6).quorum,5)
  assert.equal(configuration(20).quorum,14)
})

for(const count of [3,6,17]) test('Sesión de '+count+' participantes: configuración fija, firmas y certificado completo',async()=>{
  const classroom=createClassroom({count:10,pin:'123456'})
  await new Promise(resolve=>classroom.server.listen(0,'127.0.0.1',resolve))
  const base='http://127.0.0.1:'+classroom.server.address().port
  const wallets=Array.from({length:count},()=>eth.Wallet.createRandom()),tokens=[]
  const request=async(route,input,token,teacher=false)=>{
    const response=await fetch(base+'/api/'+route,{method:input?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{'x-participant-token':token}:{}),...(teacher?{'x-teacher-key':classroom.teacherKey}:{})},...(input?{body:JSON.stringify(input)}:{})})
    const result=await response.json()
    if(!response.ok) throw Error(result.error)
    return result
  }
  try {
    await assert.rejects(request('teacher',{action:'configure',count}),/docente/)
    let state=await request('teacher',{action:'configure',count},null,true)
    assert.equal(state.count,count)
    assert.equal(state.quorum,Math.floor(2*count/3)+1)
    await assert.rejects(request('join',{pin:'123456',slot:count+1}),/identidad/)
    for(let i=0;i<count;i++) {
      const payload={sessionId:state.sessionId,slot:i+1,name:'Estudiante '+(i+1)}
      const result=await request('join',{...payload,pin:'123456',address:wallets[i].address,signature:await sign(wallets[i],payload)})
      tokens.push(result.token)
      if(!i) await assert.rejects(request('teacher',{action:'configure',count:count+1},null,true),/primer ingreso/)
    }
    state=await request('teacher',{action:'start'},null,true)
    const block=buildBlock({parent:state.chain[0],accounts:state.accounts,transactions:[],seed:state.seed,slot:state.slot,participants:state.participants,config:state.config})
    block.signature=await sign(wallets[block.proposer-1],{hash:block.hash})
    state=await request('propose',{block},tokens[block.proposer-1])
    for(let i=0;i<state.quorum;i++) {
      assert.equal(state.chain.length,1)
      const payload={slot:state.slot,blockHash:block.hash,approve:true,voter:i+1}
      state=await request('vote',{vote:{voter:i+1,approve:true,signature:await sign(wallets[i],payload)}},tokens[i])
    }
    assert.equal(state.chain.length,2)
    assert.equal(hash(replay(state.chain,state.participants,state.seed,state.config)),block.stateRoot)
    assert.throws(()=>replay(state.chain,state.participants,state.seed,configuration(count,'otra-red')),/Génesis/)
  } finally {await classroom.close()}
})
