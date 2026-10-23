import {createServer} from 'node:http'
import {readFile} from 'node:fs/promises'
const rutas = {
  '/':['ui/index.html','text/html'], '/app.js':['ui/app.js','text/javascript'],
  '/observacion.js':['ui/observacion.js','text/javascript'],
  '/artefacto.json':['artifacts/contracts/Contador.sol/Contador.json','application/json'],
  '/vendor/ethers.js':['node_modules/ethers/dist/ethers.min.js','text/javascript']
}
const server=createServer(async(req,res)=>{
  const ruta=rutas[new URL(req.url,'http://localhost').pathname]
  if(!ruta){res.writeHead(404);res.end('Recurso inexistente');return}
  try {const datos=await readFile(ruta[0]);res.writeHead(200,{'Content-Type':ruta[1],'Cache-Control':'no-store'});res.end(datos)}
  catch {res.writeHead(404);res.end('Falta un archivo. Ejecutá npm ci y npm run compilar en esta carpeta.')}
})
server.listen(4373,'127.0.0.1',()=>console.log('Práctica de gas, historia y testnet: http://127.0.0.1:4373'))
