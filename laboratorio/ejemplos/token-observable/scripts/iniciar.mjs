import {spawn} from 'node:child_process'
import {createServer} from 'node:net'
import {mkdirSync, createWriteStream} from 'node:fs'
import {setTimeout as esperar} from 'node:timers/promises'
import {dependencias, npm, raiz} from './entorno.mjs'

const procesos = []
let cerrando = false
async function cerrar(codigo = 0) {
  if (cerrando) return
  cerrando = true
  await Promise.all(procesos.map(async proceso => {
    if (proceso.exitCode !== null || proceso.signalCode !== null) return
    const fin = new Promise(resolve => proceso.once('exit', resolve))
    proceso.kill('SIGTERM')
    await Promise.race([fin, esperar(3000)])
    if (proceso.exitCode === null && proceso.signalCode === null) proceso.kill('SIGKILL')
    await fin
  }))
  process.exitCode = codigo
}
process.on('SIGINT', () => cerrar())
process.on('SIGTERM', () => cerrar())
async function puertoLibre(puerto) {
  const servidor = createServer()
  try {
    await new Promise((resolve, reject) => { servidor.once('error', reject); servidor.listen(puerto, '127.0.0.1', resolve) })
    await new Promise(resolve => servidor.close(resolve))
  } catch (error) {
    throw Error(error.code === 'EADDRINUSE'
      ? `El puerto ${puerto} ya está en uso. Si el laboratorio está abierto, usá http://127.0.0.1:4388. Para reiniciarlo, detené su terminal con Ctrl+C. No se cerró ningún proceso ajeno.`
      : `No se puede abrir el puerto ${puerto}: ${error.message}`)
  }
}
function iniciar(argumentos, registro) {
  const proceso = spawn(process.execPath, argumentos, {cwd:raiz, stdio:['ignore','pipe','pipe']})
  procesos.push(proceso)
  proceso.stdout.pipe(registro, {end:false})
  proceso.stderr.pipe(registro, {end:false})
  proceso.once('error', error => { console.error(error.message); cerrar(1) })
  proceso.once('exit', (code, signal) => {
    if (!cerrando) {console.error(`Un servicio se detuvo (${code ?? signal}). Revisá resultados/servicios.log.`); cerrar(1)}
  })
  return proceso
}
async function listo(proceso, url, opciones, validar) {
  for (let i = 0; i < 100; i++) {
    if (cerrando || proceso.exitCode !== null || proceso.signalCode !== null) throw Error('El servicio se detuvo antes de iniciar.')
    try {
      const respuesta = await fetch(url, {...opciones, signal:AbortSignal.timeout(800)})
      if (await validar(respuesta)) return
    } catch {}
    await esperar(150)
  }
  throw Error('El servicio no respondió a tiempo. Revisá resultados/servicios.log.')
}
try {
  await puertoLibre(19685)
  await puertoLibre(4388)
  await dependencias()
  await npm(['run', 'compilar'])
  if (!cerrando) {
    mkdirSync(raiz + 'resultados', {recursive:true})
    const registro = createWriteStream(raiz + 'resultados/servicios.log', {flags:'a'})
    const nodo = iniciar(['node_modules/hardhat/dist/src/cli.js','node','--network','hardhatMainnet','--hostname','127.0.0.1','--port','19685'], registro)
    await listo(nodo, 'http://127.0.0.1:19685', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'eth_chainId',params:[]})}, async r => (await r.json()).result === '0x7a69')
    const interfaz = iniciar(['scripts/interfaz.mjs'], registro)
    await listo(interfaz, 'http://127.0.0.1:4388', {}, async r => r.ok)
    console.log('\nLaboratorio listo: http://127.0.0.1:4388\nElegí Ana → Conectar → Crear TokenAula.\nDejá esta terminal abierta. Ctrl+C detiene ambos servicios.\nAl reiniciar el nodo, creá una instancia nueva de TokenAula.\nRegistro de servicios: resultados/servicios.log')
  }
} catch (error) {
  console.error(error.message)
  await cerrar(1)
}
