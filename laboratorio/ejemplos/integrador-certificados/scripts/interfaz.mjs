import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {urlRPC} from './comun.mjs';

let disponible = true;
const rutas = {
  '/': ['ui/index.html', 'text/html; charset=utf-8'],
  '/app.js': ['ui/app.js', 'text/javascript; charset=utf-8'],
  '/estilos.css': ['ui/estilos.css', 'text/css; charset=utf-8'],
  '/despliegue.json': ['ui/despliegue.json', 'application/json'],
  '/vendor/ethers.js': ['node_modules/ethers/dist/ethers.min.js', 'text/javascript'],
  '/documentos/certificado-aula.txt': ['documentos/certificado-aula.txt', 'text/plain; charset=utf-8'],
  '/documentos/certificado-alterado.txt': ['documentos/certificado-alterado.txt', 'text/plain; charset=utf-8']
};
const servidor = createServer(async (req, res) => {
  const ruta = new URL(req.url, 'http://localhost').pathname;
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (ruta === '/rpc' && req.method === 'POST') {
      let cuerpo = '';
      for await (const parte of req) { cuerpo += parte; if (cuerpo.length > 100000) throw Error('Solicitud demasiado extensa.'); }
      const respuesta = await fetch(urlRPC, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: cuerpo, signal: AbortSignal.timeout(5000)});
      res.writeHead(respuesta.status, {'Content-Type': 'application/json'});
      res.end(await respuesta.text()); return;
    }
    if (ruta === '/disponibilidad' && req.method === 'POST') {
      let cuerpo = ''; for await (const parte of req) { cuerpo += parte; if (cuerpo.length > 100) throw Error('Solicitud invalida.'); }
      const entrada = JSON.parse(cuerpo);
      if (typeof entrada.disponible !== 'boolean') throw Error('Estado invalido.');
      disponible = entrada.disponible;
      res.writeHead(200, {'Content-Type': 'application/json'}); res.end(JSON.stringify({disponible})); return;
    }
    if (req.method !== 'GET' || !rutas[ruta]) { res.writeHead(404); res.end('Recurso inexistente.'); return; }
    if (ruta === '/documentos/certificado-aula.txt' && !disponible) { res.writeHead(503); res.end('Documento temporalmente no disponible.'); return; }
    const [archivo, tipo] = rutas[ruta], contenido = await readFile(archivo);
    res.writeHead(200, {'Content-Type': tipo}); res.end(contenido);
  } catch {
    res.writeHead(503, {'Content-Type': 'text/plain; charset=utf-8'});
    res.end(ruta === '/rpc' ? 'No se pudo consultar el nodo de la practica.' : 'Recurso no disponible. Comproba el despliegue y los archivos.');
  }
});
servidor.on('error', error => { console.error('No se pudo iniciar la interfaz: ' + error.message); process.exitCode = 1; });
servidor.listen(4273, '127.0.0.1', () => console.log('Certificados: http://127.0.0.1:4273. Mantené esta terminal abierta.'));
