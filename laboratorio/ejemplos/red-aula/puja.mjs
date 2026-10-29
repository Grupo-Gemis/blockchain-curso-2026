import {eth, hash, sign, genesis, initialAccounts, selectByTip, buildBlock} from './modelo.mjs'
const wallets=Array.from({length:10},()=>eth.Wallet.createRandom())
const participants=wallets.map((wallet,i)=>({slot:i+1,address:wallet.address}))
const bids=[['100','1'],['22','5'],['30','3'],['19','2'],['21','4']]
const pending=[]
for (const [i,[max,priority]] of bids.entries()) {
  const body={chainId:'utn-aula-10',from:i+1,to:i+1,nonce:0,value:'0',gasLimit:21000,
    maxFeePerGas:eth.parseUnits(max,9).toString(),maxPriorityFeePerGas:eth.parseUnits(priority,9).toString()}
  const tx={body,signature:await sign(wallets[i],body)}
  pending.push({...tx,id:hash(tx)})
}
const context={parent:genesis('puja',participants),accounts:initialAccounts(),seed:'puja',slot:1,participants}
const chosen=selectByTip(pending,context)
const block=buildBlock({...context,transactions:chosen})
console.log(JSON.stringify({modelo:'Supuestos didácticos. Base 20 gwei, tres transferencias de 21.000 gas como máximo.',
  pujas:bids.map(([max,priority],i)=>({nodo:i+1,maximoGwei:max,propinaMaximaGwei:priority})),
  orden:chosen.map(t=>t.body.from),gasUsado:block.gasUsed,quemaETH:eth.formatEther(block.burned),
  propinasETH:eth.formatEther(block.tips),nota:'El nodo 2 ofrece propina efectiva 2. El nodo 4 no cubre la base. No es una garantía universal de orden.'},null,2))
