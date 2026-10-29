import {verificarNode, raiz} from './entorno.mjs'
import {existsSync} from 'node:fs'
try {
  verificarNode()
  console.log('Node compatible: ' + process.versions.node)
  console.log('Carpeta: ' + raiz)
  console.log('Dependencias: ' + (existsSync(raiz + 'node_modules/hardhat/dist/src/cli.js') ? 'instaladas' : 'pendientes, ejecutá npm run preparar'))
  console.log('Contrato compilado: ' + (existsSync(raiz + 'artifacts/contracts/Contador.sol/Contador.json') ? 'sí' : 'pendiente'))
  for (const [nombre, url, opciones] of [
    ['Nodo local', 'http://127.0.0.1:19745', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({jsonrpc:'2.0',id:1,method:'eth_chainId',params:[]})}],
    ['Interfaz', 'http://127.0.0.1:4373', {}]
  ]) {
    try {
      const respuesta = await fetch(url, {...opciones, signal:AbortSignal.timeout(1500)})
      const valido = nombre === 'Nodo local' ? (await respuesta.json()).result === '0x7a69' : respuesta.ok
      console.log(nombre + ': ' + (valido ? 'responde correctamente' : 'respuesta inesperada'))
    } catch { console.log(nombre + ': detenido, se inicia con npm start') }
  }
} catch (error) { console.error(error.message); process.exitCode = 1 }
