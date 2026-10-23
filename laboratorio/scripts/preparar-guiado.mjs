import {readFile, writeFile, mkdir} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'

const root = fileURLToPath(new URL('..', import.meta.url))

export async function prepararGuiado(args = []) {
  if (args.length && (args.length !== 2 || args[0] !== '--nombre')) {
    throw Error('Uso: npm run preparar:guiado [-- --nombre otra-practica]')
  }
  const nombre = args[1] || 'unidades-04-05'
  if (!/^[a-z0-9][a-z0-9-]{0,47}$/.test(nombre)) {
    throw Error('El nombre debe usar letras minúsculas, números y guiones, sin rutas.')
  }
  const destino = path.join(root, 'practicas', nombre)
  const archivos = [
    'package-lock.json', 'hardhat.config.ts', '.gitignore',
    'scripts/comun.mjs', 'scripts/consultar.mjs', 'scripts/desplegar.mjs',
    'scripts/interfaz.mjs', 'scripts/probar.mjs', 'scripts/probar-guiado.mjs',
    'scripts/usar-contador.mjs', 'scripts/verificar-deployment.mjs',
    'scripts/verificar-entorno.mjs', 'tests/laboratorio.test.mjs',
    'ui/index.html', 'ui/app.js'
  ].map(file => [file, file])
  archivos.push(
    ['ejemplos/guiado-04-05/Contador.sol', 'contracts/Contador.sol'],
    ['ejemplos/guiado-04-05/cliente.js', 'ui/cliente.js']
  )
  // Leer primero todo lo necesario. Una fuente faltante no deja media copia.
  const contenido = await Promise.all(archivos.map(async ([source, target]) =>
    [target, await readFile(path.join(root, source))]))
  const original = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
  const comandos = ['verificar', 'compilar', 'nodo', 'desplegar', 'consultar',
    'usar:contador', 'interfaz', 'test', 'verificar:deployment']
  const paquete = {...original, scripts: Object.fromEntries(comandos.map(key => [key, original.scripts[key]]))}
  paquete.scripts.test = 'node scripts/probar-guiado.mjs'
  contenido.push(['package.json', Buffer.from(JSON.stringify(paquete, null, 2) + '\n')])
  contenido.push(['README.md', Buffer.from(`# Práctica guiada 04 y 05\n\nEl contrato y la función de confirmación están completos. No hay que programarlos.\n\nDesde esta carpeta: npm ci, npm run verificar, npm run compilar y npm test.\n\nLuego seguí los laboratorios 04 y 05 del repositorio del curso. Una terminal mantiene npm run nodo. Otra despliega, consulta y verifica. En 05, npm run interfaz mantiene el servidor de la página.\n\nnpm test comprueba Contador, Interfaz y Deployment. Son ocho casos. No evalúa automáticamente tu explicación ni asigna notas.\n\nEsta carpeta es una copia local. El preparador no la sobrescribe. Para otra copia, volvé a la carpeta laboratorio original y usá npm run preparar:guiado -- --nombre otra-practica.\n`)])
  await mkdir(path.dirname(destino), {recursive: true})
  try {
    await mkdir(destino)
  } catch (error) {
    if (error.code !== 'EEXIST') throw error
    let registro
    try { registro = JSON.parse(await readFile(path.join(destino, 'guiado.json'), 'utf8')) } catch {}
    if (registro?.tipo !== 'practica-guiada-04-05') {
      throw Error('La carpeta ya existe y no se reconoce como una copia guiada completa. No se modificó. Elegí otro nombre con --nombre.')
    }
    console.log('La práctica ya existe. Se conservan sus archivos y resultados sin sobrescribirlos.')
    mostrarInicio(destino)
    return {destino, creado: false}
  }
  for (const [target, buffer] of contenido) {
    await mkdir(path.dirname(path.join(destino, target)), {recursive: true})
    await writeFile(path.join(destino, target), buffer)
  }
  const registro = {
    tipo: 'practica-guiada-04-05', version: 1,
    creado: new Date().toISOString(),
    archivos: Object.fromEntries(contenido.map(([file, buffer]) =>
      [file, createHash('sha256').update(buffer).digest('hex')]))
  }
  await writeFile(path.join(destino, 'guiado.json'), JSON.stringify(registro, null, 2) + '\n')
  console.log('Práctica preparada con Contador y enviarYConfirmar completos.')
  console.log('No se modificaron los ejercicios originales ni se inició ningún nodo.')
  mostrarInicio(destino)
  return {destino, creado: true}
}

function mostrarInicio(destino) {
  console.log('Carpeta de práctica: ' + destino)
  console.log('Abrí esa carpeta en el editor. En su terminal ejecutá:')
  console.log('npm ci\nnpm run verificar\nnpm run compilar\nnpm test')
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await prepararGuiado(process.argv.slice(2)) }
  catch (error) { console.error('No se preparó la práctica: ' + error.message); process.exitCode = 1 }
}
