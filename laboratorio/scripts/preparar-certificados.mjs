import {readFile, writeFile, mkdir, readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

export async function prepararCertificados(args = []) {
  if (args.length && (args.length !== 2 || args[0] !== '--nombre')) throw Error('Uso: npm run preparar:certificados [-- --nombre otra-practica]');
  const nombre = args[1] || 'certificados';
  if (!/^[a-z0-9][a-z0-9-]{0,47}$/.test(nombre)) throw Error('El nombre usa letras minusculas, numeros y guiones, sin rutas.');
  const raiz = fileURLToPath(new URL('..', import.meta.url));
  const ejemplo = path.join(raiz, 'ejemplos/integrador-certificados'), destino = path.join(raiz, 'practicas', nombre);
  const contenido = [];
  async function recorrer(carpeta, prefijo = '') {
    for (const entrada of await readdir(carpeta, {withFileTypes: true})) {
      const relativa = path.join(prefijo, entrada.name), archivo = path.join(carpeta, entrada.name);
      if (entrada.isSymbolicLink()) throw Error('El ejemplo no admite enlaces simbolicos.');
      if (entrada.isDirectory()) await recorrer(archivo, relativa);
      else if (entrada.isFile()) contenido.push([relativa, await readFile(archivo)]);
    }
  }
  await recorrer(ejemplo);
  for (const archivo of ['package-lock.json', 'hardhat.config.ts', '.gitignore', 'scripts/verificar-entorno.mjs']) contenido.push([archivo, await readFile(path.join(raiz, archivo))]);
  const original = JSON.parse(await readFile(path.join(raiz, 'package.json'), 'utf8'));
  const paquete = {...original, scripts: {
    verificar: 'node scripts/verificar-entorno.mjs', compilar: 'hardhat build',
    nodo: 'hardhat node --network hardhatMainnet --hostname 127.0.0.1 --port 19645',
    desplegar: 'node scripts/desplegar.mjs', interfaz: 'node scripts/interfaz.mjs',
    recorrido: 'node scripts/recorrido.mjs', test: 'node scripts/probar.mjs'
  }};
  contenido.push(['package.json', Buffer.from(JSON.stringify(paquete, null, 2) + '\n')]);
  await mkdir(path.dirname(destino), {recursive: true});
  try { await mkdir(destino); }
  catch (error) {
    if (error.code !== 'EEXIST') throw error;
    const existente = await readFile(path.join(destino, 'guiado.json'), 'utf8').then(JSON.parse).catch(() => null);
    if (existente?.tipo !== 'integrador-certificados' || existente.version !== 1) throw Error('La carpeta ya existe y no se reconoce como esta practica. No se modifico. Elegi otro nombre.');
    console.log('Se conserva la copia existente sin sobrescribir archivos ni resultados.');
    console.log('Carpeta: ' + destino); return {destino, creado: false};
  }
  for (const [archivo, datos] of contenido) {
    await mkdir(path.dirname(path.join(destino, archivo)), {recursive: true});
    await writeFile(path.join(destino, archivo), datos);
  }
  await writeFile(path.join(destino, 'guiado.json'), JSON.stringify({tipo: 'integrador-certificados', version: 1,
    archivos: Object.fromEntries(contenido.map(([archivo, datos]) => [archivo, createHash('sha256').update(datos).digest('hex')]))}, null, 2) + '\n');
  console.log('Practica completa preparada en ' + destino);
  console.log('Abri EMPEZAR-AQUI.md. No se iniciaron servicios ni se modificaron ejercicios originales.');
  return {destino, creado: true};
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await prepararCertificados(process.argv.slice(2)); }
  catch (error) { console.error('No se preparo la practica: ' + error.message); process.exitCode = 1; }
}
