import test from 'node:test'
import assert from 'node:assert/strict'
import {eth,copy,sign} from '../modelo.mjs'
import {invitation,makeManifest,peerContext,decisionBody,roundHash} from '../pares.mjs'
import {diagnose} from '../diagnostico.mjs'
import {requestTimeout,DEFAULT_WAIT} from '../conectividad.mjs'

const wallets=Array.from({length:4},()=>eth.Wallet.createRandom())
const invitations=await Promise.all(wallets.map((wallet,i)=>invitation(wallet,i+1,'Estudiante '+(i+1),'http://100.80.1.'+(i+1)+':4781')))
const manifest=makeManifest(invitations,'comprobacion-desde-casa')
const makeState=(slot,ledger=[])=>{
  const verified=peerContext(manifest,ledger)
  return {networkId:manifest.hash,manifest:copy(manifest),invitation:copy(invitations[slot-1]),local:{slot,address:wallets[slot-1].address},ledger:copy(ledger),chain:verified.chain,accounts:verified.accounts}
}
const allStates=()=>Object.fromEntries(invitations.map(p=>[p.url+'/api/state',makeState(p.slot)]))
function reader(states) {
  return async(url,options)=>{
    assert.ok(options.signal instanceof AbortSignal)
    assert.equal(options.method,undefined)
    return {ok:true,json:async()=>copy(states[url])}
  }
}

test('Diagnóstico desde casa: cuatro direcciones VPN, identidades y copias coinciden sin modificar datos',async()=>{
  const states=allStates(),before=JSON.stringify(states)
  const report=await diagnose(manifest,{fetcher:reader(states)})
  assert.ok(report.ready)
  assert.equal(report.quorum,3)
  assert.equal(report.rows.length,4)
  assert.ok(report.rows.every(row=>row.status==='correcto' && row.height===0))
  assert.equal(JSON.stringify(states),before)
})

test('Diagnóstico: distingue equipo inaccesible, otra red, otra identidad y saldos inválidos',async()=>{
  for(const status of ['sin_respuesta','otra_red','otra_identidad','historial_invalido']) {
    const states=allStates(),url=invitations[0].url+'/api/state'
    if(status==='otra_red') states[url].networkId='otra-red'
    if(status==='otra_identidad') states[url].local.slot=2
    if(status==='historial_invalido') states[url].accounts['1'].balance='0'
    const base=reader(states)
    const fetcher=async(...args)=>{
      if(status==='sin_respuesta' && args[0]===url) throw Error('Equipo apagado')
      return base(...args)
    }
    const report=await diagnose(manifest,{fetcher})
    assert.equal(report.rows[0].status,status)
    assert.equal(report.ready,false)
    assert.equal(report.reachable,false)
    assert.ok(report.rows.slice(1).every(row=>row.status==='correcto'))
  }
})

test('Diagnóstico: un turno omitido pendiente de sincronizar impide anunciar que todas las copias coinciden',async()=>{
  const verified=peerContext(manifest,[]),roundParent=verified.roundParent,choice='skip'
  const certificate=await Promise.all(wallets.slice(0,3).map(async(wallet,i)=>{
    const body=decisionBody(manifest,1,roundParent,choice,i+1)
    return {body,signature:await sign(wallet,body)}
  }))
  const ledger=[{slot:1,roundParent,choice,block:null,certificate,hash:roundHash(manifest,1,roundParent,choice)}]
  const states=allStates()
  states[invitations[0].url+'/api/state']=makeState(1,ledger)
  const report=await diagnose(manifest,{fetcher:reader(states)})
  assert.equal(report.reachable,true)
  assert.equal(report.sameHead,true)
  assert.equal(report.sameRound,false)
  assert.equal(report.ready,false)
})

test('Espera de Internet: diez segundos iniciales y rango configurable sin valores inválidos',()=>{
  assert.equal(DEFAULT_WAIT,10000)
  assert.equal(requestTimeout(),10000)
  assert.equal(requestTimeout(15000),15000)
  for(const value of [0,-1,999,60001,1000.5,NaN,'15000']) assert.throws(()=>requestTimeout(value),/1000 y 60000/)
})
