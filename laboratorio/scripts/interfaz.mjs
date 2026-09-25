import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const rutas={'/':['ui/index.html','text/html'],'/app.js':['ui/app.js','text/javascript'],'/cliente.js':['ui/cliente.js','text/javascript'],'/despliegue.json':['ui/despliegue.json','application/json'],'/vendor/ethers.js':['node_modules/ethers/dist/ethers.min.js','text/javascript']};
const server=createServer(async(req,res)=>{const ruta=rutas[new URL(req.url,'http://localhost').pathname];if(!ruta){res.writeHead(404);res.end('Recurso inexistente');return;}try{const b=await readFile(ruta[0]);res.writeHead(200,{'Content-Type':ruta[1],'Cache-Control':'no-store'});res.end(b);}catch{res.writeHead(404);res.end('Falta el despliegue. Ejecutá npm run desplegar.');}});
server.listen(4173,'127.0.0.1',()=>console.log('Interfaz del laboratorio: http://127.0.0.1:4173'));
