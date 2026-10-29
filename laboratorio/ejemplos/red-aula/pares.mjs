import {eth, configuration, membership, stable, copy, hash, sign, signedBy, genesis,
  initialAccounts, proposerFor, checkBlock, blockBody} from './modelo.mjs'

export function publicURL(value) {
  const url = new URL(value)
  if (url.protocol !== 'http:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw Error('Usá una dirección HTTP del nodo, sin ruta, contraseña ni parámetros.')
  return url.origin
}
export async function invitation(wallet, slot, name, url) {
  const body = {kind:'invitation', slot, name, url:publicURL(url), address:wallet.address}
  return {...body, signature:await sign(wallet,body)}
}
export function checkInvitation(value) {
  const {signature, ...body} = value || {}
  if (stable(Object.keys(body).sort()) !== stable(['address','kind','name','slot','url']) || body.kind !== 'invitation' || !Number.isInteger(body.slot) || body.slot < 1 || body.slot > 60 || typeof body.name !== 'string' || !body.name.trim() || body.name.length > 40 || publicURL(body.url) !== body.url || !eth.isAddress(body.address) || !signedBy(body, signature, body.address)) throw Error('Invitación de nodo inválida o sin firma.')
  return value
}
export function makeManifest(invitations, seed, name = 'Red de aula') {
  const participants = copy(invitations).sort((a,b) => a.slot-b.slot)
  participants.forEach(checkInvitation)
  const config = configuration(participants.length, 'utn-p2p-' + hash({seed,participants}).slice(2,26))
  const body = {version:1, name, seed, config, participants}
  const manifest = {...body, hash:hash(body)}
  checkManifest(manifest)
  return manifest
}
export function checkManifest(manifest) {
  const {hash:checksum,...body} = manifest || {}
  if (body.version !== 1 || typeof body.name !== 'string' || !body.name.trim() || body.name.length > 80 || typeof body.seed !== 'string' || !body.seed || body.seed.length > 100 || !Array.isArray(body.participants)) throw Error('Archivo de red inválido.')
  if (stable(Object.keys(body).sort()) !== stable(['config','name','participants','seed','version']) || hash(body) !== checksum) throw Error('La huella del archivo de red no coincide.')
  membership(body.participants,body.config)
  body.participants.forEach(checkInvitation)
  if (new Set(body.participants.map(p=>p.url)).size !== body.config.count || body.participants.some((p,i)=>p.slot!==i+1)) throw Error('Las direcciones deben ser distintas y las identidades estar ordenadas.')
  const expectedId = 'utn-p2p-' + hash({seed:body.seed,participants:body.participants}).slice(2,26)
  if (body.config.chainId !== expectedId) throw Error('El identificador de red no corresponde a sus integrantes.')
  return manifest
}
export function initialLedger(manifest) {
  return genesis(manifest.seed,manifest.participants,manifest.config)
}
export function decisionBody(manifest, slot, roundParent, choice, voter) {
  return {kind:'decision', networkId:manifest.hash, slot, roundParent, choice, voter}
}
export function checkDecision(vote, manifest, slot, roundParent, choice = vote?.body?.choice) {
  const voter = vote?.body?.voter, participant = manifest.participants.find(p=>p.slot===voter)
  if (!participant || (choice !== 'skip' && !/^0x[0-9a-f]{64}$/.test(choice)) || stable(vote.body) !== stable(decisionBody(manifest,slot,roundParent,choice,voter)) || !signedBy(vote.body,vote.signature,participant.address)) throw Error('Decisión de turno inválida o de otra red.')
  return vote
}
export function roundHash(manifest, slot, roundParent, choice) {
  return hash({networkId:manifest.hash,slot,roundParent,choice})
}
export function peerContext(manifest, ledger) {
  let accounts = initialAccounts(manifest.config.count)
  const chain = [initialLedger(manifest)]
  let roundParent = chain[0].hash
  if (!Array.isArray(ledger) || ledger.length > 200) throw Error('La práctica admite hasta 200 turnos por sesión.')
  for (let i=0;i<ledger.length;i++) {
    const record=ledger[i], slot=i+1
    if (record.slot !== slot || record.roundParent !== roundParent || record.hash !== roundHash(manifest,slot,roundParent,record.choice) || !Array.isArray(record.certificate) || record.certificate.length > manifest.config.count) throw Error('Secuencia de turnos o huella inconsistente.')
    const voters = new Set()
    for (const vote of record.certificate) {
      checkDecision(vote,manifest,slot,roundParent,record.choice)
      if (voters.has(vote.body.voter)) throw Error('Una identidad no puede contar dos veces en el certificado.')
      voters.add(vote.body.voter)
    }
    if (voters.size < manifest.config.quorum) throw Error('El turno no tiene suficientes firmas distintas.')
    if (record.choice === 'skip') {
      if (record.block !== null) throw Error('Un turno omitido no incorpora un bloque.')
    } else {
      if (record.block?.hash !== record.choice) throw Error('Las firmas no corresponden al bloque.')
      const result=checkBlock(record.block,{parent:chain.at(-1),accounts,slot,seed:manifest.seed,participants:manifest.participants,config:manifest.config})
      accounts=result.accounts
      chain.push({...copy(record.block),certificate:copy(record.certificate)})
    }
    roundParent=record.hash
  }
  return {accounts,chain,slot:ledger.length+1,roundParent,
    proposer:proposerFor(manifest.seed,ledger.length+1,manifest.config.count)}
}
export function checkProposal(proposal, manifest, context) {
  const {body,signature}=proposal || {}, participant=manifest.participants.find(p=>p.slot===context.proposer)
  if (!body || stable(Object.keys(body).sort()) !== stable(['block','kind','networkId','roundParent','slot']) || body.kind !== 'proposal' || body.networkId !== manifest.hash || body.slot !== context.slot || body.roundParent !== context.roundParent || !signedBy(body,signature,participant.address)) throw Error('Propuesta de otro turno, red o proponente.')
  const block=body.block
  if (!block || block.proposer !== context.proposer || block.slot !== context.slot || !Array.isArray(block.transactions) || block.transactions.length > 4 || block.hash !== hash(blockBody(block)) || !signedBy({hash:block.hash},block.signature,participant.address)) throw Error('Firma o estructura de bloque inválida.')
  // Un estado incorrecto puede circular como experimento. Aprobarlo exige checkBlock.
  return proposal
}
