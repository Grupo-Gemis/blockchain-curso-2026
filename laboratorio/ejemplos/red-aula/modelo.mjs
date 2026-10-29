// El mismo modelo se ejecuta en cada navegador y en el coordinador del aula.
// ethers se incluye localmente para funcionar también por HTTP en una red de aula.
export const eth = globalThis.ethers || (await import('./vendor/ethers.umd.cjs')).default
export const NODOS = 10
export const QUORUM = 7
export const CHAIN_ID = 'utn-aula-10'
export const GAS_TX = 21000
export const GAS_BLOQUE = 63000
export const BASE_INICIAL = '20000000000'
export const SALDO_INICIAL = '1000000000000000000'
export const MIN_NODOS = 2
export const MAX_NODOS = 60
export function configuration(count = NODOS, chainId = 'utn-aula-' + count) {
  if (!Number.isInteger(count) || count < MIN_NODOS || count > MAX_NODOS) throw Error('La cantidad debe ser un entero entre 2 y 60 participantes.')
  if (typeof chainId !== 'string' || !/^[a-zA-Z0-9-]{1,100}$/.test(chainId)) throw Error('Identificador de red inválido.')
  return {count, quorum:Math.floor(2 * count / 3) + 1, chainId}
}
export function membership(participants, config = configuration(participants.length)) {
  const expected = configuration(config.count, config.chainId)
  if (stable(expected) !== stable(config) || participants.length !== config.count) throw Error('Configuración o cantidad de participantes inconsistente.')
  const slots = new Set(), addresses = new Set()
  for (const p of participants) {
    if (!Number.isInteger(p.slot) || p.slot < 1 || p.slot > config.count || slots.has(p.slot) || !eth.isAddress(p.address) || addresses.has(p.address.toLowerCase())) throw Error('Las identidades deben ser distintas y cubrir los números de 1 a ' + config.count + '.')
    slots.add(p.slot)
    addresses.add(p.address.toLowerCase())
  }
  return expected
}
export const copy = value => JSON.parse(JSON.stringify(value))
export function stable(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']'
  return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + stable(value[k])).join(',') + '}'
}
export const hash = value => eth.sha256(eth.toUtf8Bytes(stable(value)))
export const sign = (wallet, payload) => wallet.signMessage(eth.getBytes(hash(payload)))
export function signedBy(payload, signature, address) {
  try { return eth.verifyMessage(eth.getBytes(hash(payload)), signature).toLowerCase() === address.toLowerCase() }
  catch { return false }
}
export function uint(value, name) {
  if (typeof value !== 'string' || !/^(0|[1-9][0-9]{0,39})$/.test(value)) throw Error(name + ' debe ser un entero no negativo escrito como texto.')
  return BigInt(value)
}
export function nextBaseFee(parent) {
  const base = uint(parent.baseFeePerGas, 'Tarifa base')
  // La primera ronda usa el precio inicial configurado, como condición de génesis.
  if (parent.kind === 'genesis') return base.toString()
  const used = BigInt(parent.gasUsed), target = BigInt(Math.floor(parent.gasLimit / 2))
  if (target <= 0n || used < 0n || used > BigInt(parent.gasLimit)) throw Error('Bloque padre fuera del modelo de gas.')
  if (used === target) return base.toString()
  if (used > target) {
    const delta = base * (used - target) / target / 8n
    return (base + (delta > 0n ? delta : 1n)).toString()
  }
  return (base - base * (target - used) / target / 8n).toString()
}
export function effectiveTip(tx, baseFee) {
  const max = uint(tx.maxFeePerGas, 'Máximo'), priority = uint(tx.maxPriorityFeePerGas, 'Propina'), base = BigInt(baseFee)
  if (max < priority) throw Error('La propina máxima supera el máximo total por gas.')
  return max < base ? null : (priority < max - base ? priority : max - base)
}
export function initialAccounts(count = NODOS) {
  configuration(count)
  return Object.fromEntries(Array.from({length:count}, (_, i) => [String(i + 1), {balance:SALDO_INICIAL, nonce:0}]))
}
export function checkTransaction(tx, participants, config = configuration(participants.length)) {
  const keys = ['chainId','from','to','nonce','value','gasLimit','maxFeePerGas','maxPriorityFeePerGas'].sort()
  if (!tx?.body || stable(Object.keys(tx.body).sort()) !== stable(keys)) throw Error('Campos de transacción incorrectos.')
  const body = tx.body
  if (body.chainId !== config.chainId) throw Error('Identificador de red incorrecto.')
  if (![body.from, body.to].every(n => Number.isInteger(n) && n >= 1 && n <= config.count)) throw Error('Participante fuera de 1 a ' + config.count + '.')
  if (!Number.isSafeInteger(body.nonce) || body.nonce < 0 || body.gasLimit !== GAS_TX) throw Error('Nonce o límite de gas incorrecto.')
  uint(body.value, 'Valor')
  effectiveTip(body, '0')
  const sender = participants.find(p => p.slot === body.from)
  if (!sender || !signedBy(body, tx.signature, sender.address)) throw Error('Firma de transacción inválida.')
  if (tx.id !== hash({body, signature:tx.signature})) throw Error('Hash de transacción incorrecto.')
  return true
}
export function execute(accounts, transactions, baseFee, proposer, participants, gasLimit = GAS_BLOQUE, config = configuration(participants.length)) {
  const next = copy(accounts)
  let gasUsed = 0, burned = 0n, tips = 0n
  const receipts = []
  for (const tx of transactions) {
    checkTransaction(tx, participants, config)
    const body = tx.body, sender = next[body.from], recipient = next[body.to]
    const tip = effectiveTip(body, baseFee)
    if (tip === null) throw Error('El máximo no cubre la tarifa base del bloque.')
    if (sender.nonce !== body.nonce) throw Error('Nonce no ejecutable: falta una operación anterior o ya fue consumido.')
    if (gasUsed + body.gasLimit > gasLimit) throw Error('Las transacciones superan el gas disponible en el bloque.')
    const value = BigInt(body.value), maximum = value + BigInt(body.gasLimit) * BigInt(body.maxFeePerGas)
    if (BigInt(sender.balance) < maximum) throw Error('El saldo no cubre valor más el máximo autorizado de gas.')
    const fee = BigInt(GAS_TX) * (BigInt(baseFee) + tip)
    sender.balance = (BigInt(sender.balance) - value - fee).toString()
    recipient.balance = (BigInt(recipient.balance) + value).toString()
    next[proposer].balance = (BigInt(next[proposer].balance) + BigInt(GAS_TX) * tip).toString()
    sender.nonce++
    gasUsed += GAS_TX
    burned += BigInt(GAS_TX) * BigInt(baseFee)
    tips += BigInt(GAS_TX) * tip
    receipts.push({id:tx.id, gasUsed:GAS_TX, effectiveGasPrice:(BigInt(baseFee) + tip).toString(), fee:fee.toString()})
  }
  return {accounts:next, gasUsed, burned:burned.toString(), tips:tips.toString(), receipts}
}
export function proposerFor(seed, slot, count = NODOS) {
  configuration(count)
  if (!Number.isSafeInteger(slot) || slot < 1) throw Error('Turno inválido.')
  const cycle = Math.floor((slot - 1) / count)
  const order = Array.from({length:count},(_,i) => i+1).sort((a,b) => {
    const first = hash({seed,cycle,participant:a}), second = hash({seed,cycle,participant:b})
    return first < second ? -1 : first > second ? 1 : a-b
  })
  return order[(slot - 1) % count]
}
export function genesis(seed, participants, config = configuration(participants.length)) {
  membership(participants, config)
  const accounts = initialAccounts(config.count)
  const body = {kind:'genesis', chainId:config.chainId, config, height:0, slot:0, seed,
    participants:participants.map(({slot,address}) => ({slot,address})),
    baseFeePerGas:BASE_INICIAL, gasLimit:GAS_BLOQUE, gasUsed:0, stateRoot:hash(accounts)}
  return {...body, hash:hash(body)}
}
export function blockBody(block) {
  const {hash:ignoredHash, signature, certificate, ...body} = block
  return body
}
export function buildBlock({parent, accounts, transactions, slot, seed, participants, config = configuration(participants.length, parent.chainId)}) {
  const proposer = proposerFor(seed, slot, config.count), baseFeePerGas = nextBaseFee(parent)
  const result = execute(accounts, transactions, baseFeePerGas, proposer, participants, GAS_BLOQUE, config)
  const body = {kind:'block', chainId:config.chainId, height:parent.height + 1, parentHash:parent.hash,
    slot, proposer, baseFeePerGas, gasLimit:GAS_BLOQUE, gasUsed:result.gasUsed,
    stateRoot:hash(result.accounts), burned:result.burned, tips:result.tips, transactions:copy(transactions)}
  return {...body, hash:hash(body)}
}
export function checkBlock(block, {parent, accounts, slot, seed, participants, config = configuration(participants.length, parent.chainId)}) {
  if (!block || block.slot !== slot || block.proposer !== proposerFor(seed, slot, config.count)) throw Error('Proponente o turno incorrecto.')
  if (!Array.isArray(block.transactions) || block.transactions.length > 3) throw Error('Cantidad de transacciones fuera del límite.')
  const expected = buildBlock({parent, accounts, transactions:block.transactions, slot, seed, participants, config})
  if (stable(blockBody(block)) !== stable(blockBody(expected)) || block.hash !== expected.hash) throw Error('El bloque no coincide con la ejecución independiente, su estado o su enlace.')
  const proposer = participants.find(p => p.slot === block.proposer)
  if (!proposer || !signedBy({hash:block.hash}, block.signature, proposer.address)) throw Error('Firma de propuesta inválida.')
  return execute(accounts, block.transactions, block.baseFeePerGas, block.proposer, participants, GAS_BLOQUE, config)
}
export function checkVote(vote, block, participant) {
  const payload = {slot:block.slot, blockHash:block.hash, approve:vote.approve, voter:vote.voter}
  if (typeof vote.approve !== 'boolean' || vote.voter !== participant?.slot || !signedBy(payload, vote.signature, participant.address)) throw Error('Firma de voto inválida.')
  return payload
}
export function replay(chain, participants, seed, config = configuration(participants.length)) {
  if (!Array.isArray(chain) || !chain.length || stable(chain[0]) !== stable(genesis(seed, participants, config))) throw Error('Génesis inconsistente.')
  let accounts = initialAccounts(config.count)
  for (let i = 1; i < chain.length; i++) {
    const block = chain[i], parent = chain[i - 1]
    if (block.slot <= parent.slot) throw Error('Los turnos de la cadena no avanzan.')
    const result = checkBlock(block, {parent, accounts, slot:block.slot, seed, participants, config})
    const approvals = new Set()
    for (const vote of block.certificate || []) {
      const participant = participants.find(p => p.slot === vote.voter)
      checkVote(vote, block, participant)
      if (!vote.approve || approvals.has(vote.voter)) throw Error('Certificado duplicado o con un rechazo.')
      approvals.add(vote.voter)
    }
    if (approvals.size < config.quorum) throw Error('Falta el certificado de ' + config.quorum + ' votos diferentes.')
    accounts = result.accounts
  }
  return accounts
}
export function selectByTip(pending, context) {
  let selected = [], remaining = [...pending], accounts = copy(context.accounts)
  const config = context.config || configuration(context.participants.length, context.parent.chainId)
  const base = nextBaseFee(context.parent), proposer = proposerFor(context.seed, context.slot, config.count)
  while (selected.length < 3) {
    const candidates = remaining.map((tx,index) => ({tx,index,tip:effectiveTip(tx.body, base)}))
      .filter(({tx,tip}) => tip !== null && tx.body.nonce === accounts[tx.body.from].nonce)
      .sort((a,b) => a.tip === b.tip ? a.index - b.index : a.tip > b.tip ? -1 : 1)
    let chosen
    for (const row of candidates) {
      try {
        const result = execute(accounts, [row.tx], base, proposer, context.participants, GAS_BLOQUE, config)
        accounts = result.accounts
        chosen = row.tx
        break
      } catch {}
    }
    if (!chosen) break
    selected.push(chosen)
    remaining = remaining.filter(tx => tx.id !== chosen.id)
  }
  return selected
}
