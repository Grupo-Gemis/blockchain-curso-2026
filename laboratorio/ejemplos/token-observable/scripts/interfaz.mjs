import {createServer} from 'node:http'
import {readFile} from 'node:fs/promises'
const routes = {
  '/': ['ui/index.html', 'text/html'], '/app.mjs': ['ui/app.mjs', 'text/javascript'],
  '/operaciones.mjs': ['ui/operaciones.mjs', 'text/javascript'], '/estilos.css': ['ui/estilos.css', 'text/css'],
  '/artefacto.json': ['artifacts/contracts/TokenAula.sol/TokenAula.json', 'application/json'],
  '/TokenAula.sol': ['contracts/TokenAula.sol', 'text/plain'],
  '/vendor/ethers.js': ['node_modules/ethers/dist/ethers.min.js', 'text/javascript'],
  '/guia': ['GUIA-08.md', 'text/plain'], '/white-paper.md': ['white-paper.md', 'text/plain']
}
const server = createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {res.writeHead(405);res.end();return}
  const route = routes[new URL(req.url, 'http://localhost').pathname]
  if (!route) {res.writeHead(404);res.end('Recurso inexistente');return}
  try {
    const data = await readFile(route[0])
    res.writeHead(200, {'Content-Type': route[1] + '; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'})
    res.end(req.method === 'HEAD' ? undefined : data)
  } catch {res.writeHead(404);res.end('Falta un archivo. Ejecutá npm run preparar en esta carpeta.')}
})
server.listen(4388, '127.0.0.1', () => console.log('TokenAula: http://127.0.0.1:4388'))
