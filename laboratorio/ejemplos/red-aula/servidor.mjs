import {createServer} from 'node:http'
import {randomBytes} from 'node:crypto'
import {readFile, mkdir, writeFile} from 'node:fs/promises'
import {networkInterfaces} from 'node:os'
import {fileURLToPath} from 'node:url'
import path from 'node:path'
import {configuration, GAS_BLOQUE, copy, hash, genesis, initialAccounts, proposerFor,
  checkTransaction, effectiveTip, checkBlock, checkVote, nextBaseFee, signedBy, eth} from './modelo.mjs'

const root = fileURLToPath(new URL('.', import.meta.url))
export function createClassroom(options = {}) {
  const teacherKey = options.teacherKey || randomBytes(24).toString('hex')
  const pin = options.pin || String(100000 + Math.floor(Math.random() * 900000))
  const seed = options.seed || randomBytes(16).toString('hex')
  const sessionId = randomBytes(8).toString('hex')
  const participants = [], tokens = new Map(), seen = new Map()
  let proposalContext
  let config = configuration(options.count)
  const state = {version:1, mode:'coordinada', model:'Simulación didáctica con coordinador central de mensajes. Su caída interrumpe el intercambio. No es Ethereum ni Sepolia.',
    sessionId, seed, config, count:config.count, chainId:config.chainId, quorum:config.quorum, gasLimit:GAS_BLOQUE,
    participants, phase:'waiting', slot:0, proposer:null, chain:[], accounts:initialAccounts(config.count),
    pending:[], proposal:null, votes:[], finalizedHeight:0, events:[], rounds:[]}
  const event = (kind, detail) => {
    state.events.push({at:new Date().toISOString(), slot:state.slot, kind, detail})
    if (state.events.length > 200) state.events.shift()
  }
  const snapshot = () => ({...copy(state), participants:participants.map(p => ({...p, online:Date.now() - (seen.get(p.slot) || 0) < 6000}))})
  let persistence = Promise.resolve()
  const save = () => {
    if (!options.outputDir) return
    const data = JSON.stringify(snapshot(), null, 2) + '\n'
    persistence = persistence.then(async () => {
      await mkdir(options.outputDir, {recursive:true})
      await writeFile(path.join(options.outputDir, 'aula-' + sessionId + '.json'), data)
    })
    persistence.catch(error => console.error('No se pudo guardar la evidencia: ' + error.message))
  }
  const authenticate = request => {
    const slot = tokens.get(request.headers['x-participant-token'])
    if (!slot) throw Error('Ingresá con tu identidad de estudiante.')
    seen.set(slot, Date.now())
    return slot
  }
  const teacher = request => {
    if (request.headers['x-teacher-key'] !== teacherKey) throw Error('Se necesita el acceso docente de esta sesión.')
  }
  const body = async request => {
    let data = ''
    for await (const chunk of request) {
      data += chunk
      if (data.length > 200000) throw Error('Solicitud demasiado grande.')
    }
    return JSON.parse(data || '{}')
  }
  const json = (response, value, status = 200) => {
    response.writeHead(status, {'Content-Type':'application/json', 'Cache-Control':'no-store'})
    response.end(JSON.stringify(value))
  }
  const server = createServer(async (request,response) => {
    try {
      const url = new URL(request.url, 'http://localhost')
      if (request.method === 'GET' && url.pathname === '/api/state') {
        const slot = tokens.get(request.headers['x-participant-token'])
        if (slot) seen.set(slot, Date.now())
        return json(response, snapshot())
      }
      if (request.method === 'GET' && url.pathname === '/api/export') return json(response, snapshot())
      if (request.method === 'POST' && url.pathname.startsWith('/api/')) {
        const input = await body(request)
        if (url.pathname === '/api/join') {
          if (input.pin !== pin) throw Error('Código de aula incorrecto.')
          if (state.phase !== 'waiting') throw Error('La red ya comenzó. Conservá la pestaña que tiene tu identidad.')
          if (!Number.isInteger(input.slot) || input.slot < 1 || input.slot > config.count) throw Error('Elegí una identidad de 1 a ' + config.count + '.')
          if (participants.some(p => p.slot === input.slot)) throw Error('Esa identidad ya está ocupada.')
          if (typeof input.name !== 'string' || !input.name.trim() || input.name.length > 40) throw Error('Escribí un nombre de hasta cuarenta caracteres.')
          if (!eth.isAddress(input.address) || participants.some(p => p.address.toLowerCase() === input.address.toLowerCase())) throw Error('Dirección inválida o repetida.')
          const payload = {sessionId, slot:input.slot, name:input.name.trim()}
          if (!signedBy(payload, input.signature, input.address)) throw Error('No se pudo verificar la firma de ingreso.')
          participants.push({...payload, address:input.address})
          participants.sort((a,b) => a.slot - b.slot)
          const token = randomBytes(24).toString('hex')
          tokens.set(token, input.slot)
          seen.set(input.slot, Date.now())
          event('ingreso', 'Se incorporó el nodo ' + input.slot + '.')
          save()
          return json(response, {token, slot:input.slot, sessionId})
        }
        if (url.pathname === '/api/teacher') {
          teacher(request)
          if (input.action === 'configure') {
            if (state.phase !== 'waiting' || participants.length) throw Error('La cantidad se fija antes del primer ingreso. Para otro curso iniciá una sesión nueva.')
            config = configuration(input.count)
            Object.assign(state, {config, count:config.count, chainId:config.chainId, quorum:config.quorum, accounts:initialAccounts(config.count)})
            event('configuracion', config.count + ' participantes. Quórum: ' + config.quorum + '.')
            save()
            return json(response, snapshot())
          }
          if (input.action === 'start') {
            if (state.phase !== 'waiting' || participants.length !== config.count) throw Error('Para comenzar deben ingresar las ' + config.count + ' identidades.')
            state.chain = [genesis(seed, participants, config)]
          } else if (input.action === 'next') {
            if (state.phase === 'waiting') throw Error('Primero iniciá la red.')
            state.rounds.push({slot:state.slot, proposal:copy(state.proposal), votes:copy(state.votes), committed:state.phase === 'certified'})
          } else throw Error('Acción docente desconocida.')
          state.slot++
          state.proposer = proposerFor(seed, state.slot, config.count)
          state.phase = 'open'
          state.proposal = null
          proposalContext = null
          state.votes = []
          event('turno', 'Turno ' + state.slot + ': propone el nodo ' + state.proposer + '.')
        } else if (url.pathname === '/api/transaction') {
          const slot = authenticate(request), tx = input.transaction
          if (state.phase === 'waiting') throw Error('Esperá el inicio de la red.')
          if (state.phase === 'voting') throw Error('La propuesta está en votación. Esperá el próximo turno para enviar o reemplazar.')
          checkTransaction(tx, participants, config)
          if (tx.body.from !== slot) throw Error('Solo podés enviar con tu propia identidad.')
          const account = state.accounts[slot]
          if (tx.body.nonce < account.nonce || tx.body.nonce > account.nonce + 20) throw Error('Nonce fuera de la ventana de esta práctica.')
          const maximum = BigInt(tx.body.value) + BigInt(tx.body.gasLimit) * BigInt(tx.body.maxFeePerGas)
          if (BigInt(account.balance) < maximum) throw Error('Saldo insuficiente para el máximo firmado.')
          const previous = state.pending.find(t => t.body.from === slot && t.body.nonce === tx.body.nonce)
          if (previous) {
            const bump = old => (BigInt(old) * 110n + 99n) / 100n
            if (BigInt(tx.body.maxFeePerGas) < bump(previous.body.maxFeePerGas) || BigInt(tx.body.maxPriorityFeePerGas) < bump(previous.body.maxPriorityFeePerGas)) throw Error('La política de reemplazo del aula exige subir ambos topes al menos 10%.')
            state.pending = state.pending.filter(t => t !== previous)
          } else if (state.pending.length >= 100) throw Error('La cola de esta práctica llegó a cien transacciones.')
          state.pending.push(copy(tx))
          event('transaccion', 'Nodo ' + slot + ': transacción pendiente con nonce ' + tx.body.nonce + '.')
        } else if (url.pathname === '/api/propose') {
          const slot = authenticate(request), block = input.block
          if (state.phase !== 'open' || slot !== state.proposer) throw Error('Solo el proponente asignado puede proponer una vez en este turno.')
          if (!block || block.slot !== state.slot || block.proposer !== slot || block.hash !== hash(Object.fromEntries(Object.entries(block).filter(([key]) => !['hash','signature','certificate'].includes(key)))) || !signedBy({hash:block.hash}, block.signature, participants.find(p => p.slot === slot).address)) throw Error('La propuesta no tiene identidad, hash y firma coherentes.')
          if (JSON.stringify(block).length > 80000 || !Array.isArray(block.transactions) || block.transactions.length > 4) throw Error('Propuesta fuera del tamaño de la práctica.')
          for (const tx of block.transactions) if (!state.pending.some(p => p.id === tx.id && JSON.stringify(p) === JSON.stringify(tx))) throw Error('La propuesta incluye una transacción ajena a la cola del aula.')
          state.proposal = copy(block)
          proposalContext = {parent:copy(state.chain.at(-1)), accounts:copy(state.accounts), slot:state.slot, seed, participants, config}
          state.phase = 'voting'
          event('propuesta', 'Nodo ' + slot + ': propuesta difundida. Cada nodo debe comprobarla.')
        } else if (url.pathname === '/api/vote') {
          const slot = authenticate(request), vote = input.vote
          if (!['voting','certified'].includes(state.phase) || !state.proposal) throw Error('No hay una propuesta para atestiguar en este turno.')
          if (slot !== vote?.voter || state.votes.some(v => v.voter === slot)) throw Error('Cada identidad puede emitir un solo voto por turno.')
          checkVote(vote, state.proposal, participants.find(p => p.slot === slot))
          if (vote.approve) checkBlock(state.proposal, proposalContext)
          state.votes.push(copy(vote))
          event('voto', 'Nodo ' + slot + (vote.approve ? ': aprobación firmada.' : ': rechazo firmado.'))
          const approvals = state.votes.filter(v => v.approve)
          if (approvals.length >= config.quorum && state.phase === 'voting') {
            const result = checkBlock(state.proposal, proposalContext)
            state.chain.push({...copy(state.proposal), certificate:copy(approvals)})
            state.accounts = result.accounts
            state.finalizedHeight = Math.max(0, state.chain.at(-1).height - 1)
            state.pending = state.pending.filter(tx => tx.body.nonce >= state.accounts[tx.body.from].nonce)
            state.phase = 'certified'
            event('certificado', config.quorum + ' firmas distintas certifican el bloque ' + state.chain.at(-1).height + '.')
          } else if (state.phase === 'certified') {
            state.chain.at(-1).certificate = copy(approvals)
          }
        } else return json(response, {error:'Acceso inexistente.'}, 404)
        save()
        return json(response, snapshot())
      }
      const files = {'/':['index.html','text/html'], '/guia-pares':['NODOS-INDEPENDIENTES.md','text/plain'], '/guia-internet':['DESDE-CASA.md','text/plain'], '/app.js':['app.js','text/javascript'],
        '/modelo.mjs':['modelo.mjs','text/javascript'], '/styles.css':['styles.css','text/css'],
        '/vendor/ethers.umd.cjs':['vendor/ethers.umd.cjs','text/javascript']}
      if (request.method !== 'GET' || !files[url.pathname]) return json(response, {error:'Archivo inexistente.'}, 404)
      const [file,type] = files[url.pathname]
      response.writeHead(200, {'Content-Type':type + '; charset=utf-8', 'Cache-Control':'no-store',
        'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'no-referrer'})
      response.end(await readFile(path.join(root,file)))
    } catch (error) { json(response, {error:error.message}, 400) }
  })
  return {server, teacherKey, pin, snapshot, async close() {
    server.closeAllConnections()
    await new Promise(resolve => server.close(resolve))
    await persistence
  }}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const portIndex = process.argv.indexOf('--puerto'), port = portIndex >= 0 ? Number(process.argv[portIndex + 1]) : 4780
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw Error('Puerto inválido.')
  const host = process.argv.includes('--aula') ? '0.0.0.0' : '127.0.0.1'
  const countIndex = process.argv.indexOf('--estudiantes')
  const count = countIndex >= 0 ? Number(process.argv[countIndex + 1]) : undefined
  const classroom = createClassroom({count, outputDir:path.join(root,'resultados')})
  classroom.server.once('error', error => {
    console.error(error.code === 'EADDRINUSE' ? 'El puerto ' + port + ' ya está ocupado. Se conservó el proceso que lo usa.' : error.message)
    process.exitCode = 1
  })
  classroom.server.listen(port, host, () => {
    console.log('Red coordinada para ' + classroom.snapshot().count + ' estudiantes. Código de ingreso: ' + classroom.pin)
    console.log('Acceso docente local: http://127.0.0.1:' + port + '/#docente=' + classroom.teacherKey)
    if (host === '0.0.0.0') {
      for (const network of Object.values(networkInterfaces()).flat()) if (network.family === 'IPv4' && !network.internal) console.log('Estudiantes en la misma red: http://' + network.address + ':' + port)
    } else console.log('Ensayo en esta computadora: http://127.0.0.1:' + port)
    console.log('La sesión y su evidencia se guardan en resultados. Ctrl+C termina esta sesión.')
  })
  for (const signal of ['SIGINT','SIGTERM']) process.once(signal, async () => {await classroom.close()})
}
