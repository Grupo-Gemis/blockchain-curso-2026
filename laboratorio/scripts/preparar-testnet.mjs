import {readFile, writeFile, mkdir, readdir, chmod} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'

export async function prepararTestnet(args = []) {
  if (args.length && (args.length !== 2 || args[0] !== '--nombre')) throw Error('Uso: npm run preparar:testnet [-- --nombre otra-practica]')
  const nombre = args[1] || 'testnet-observable'
  if (!/^[a-z0-9][a-z0-9-]{0,47}$/.test(nombre)) throw Error('Usá letras minúsculas, números y guiones, sin rutas.')
  const root = fileURLToPath(new URL('..', import.meta.url))
  const destino = path.join(root, 'practicas', nombre), contenido = []
  async function recorrer(carpeta, prefijo = '') {
    for (const entrada of await readdir(carpeta, {withFileTypes:true})) {
      if (entrada.isSymbolicLink()) throw Error('No se admiten enlaces simbólicos en el ejemplo.')
      const relativa = path.join(prefijo, entrada.name), archivo = path.join(carpeta, entrada.name)
      if (entrada.isDirectory()) await recorrer(archivo, relativa)
      else contenido.push([relativa, await readFile(archivo)])
    }
  }
  await recorrer(path.join(root, 'ejemplos/testnet-observable'))
  if (!contenido.some(([nombre]) => nombre === 'package.json') || !contenido.some(([nombre]) => nombre === 'package-lock.json')) throw Error('Falta el paquete autónomo de la práctica.')
  await mkdir(path.dirname(destino), {recursive:true})
  try { await mkdir(destino) } catch(error) {
    if(error.code !== 'EEXIST') throw error
    const previo = await readFile(path.join(destino,'guiado.json'),'utf8').then(JSON.parse).catch(()=>null)
    if(previo?.tipo !== 'testnet-observable') throw Error('La carpeta ya existe. Se conservó sin modificar. Elegí otro nombre.')
    console.log('La práctica ya existe. Se conservan archivos y resultados. Carpeta: '+destino)
    return {destino,creado:false}
  }
  for(const [archivo,datos] of contenido) {
    await mkdir(path.dirname(path.join(destino,archivo)),{recursive:true})
    await writeFile(path.join(destino,archivo),datos)
    if (archivo.endsWith('.command')) await chmod(path.join(destino,archivo),0o755)
  }
  await writeFile(path.join(destino,'guiado.json'),JSON.stringify({tipo:'testnet-observable',version:2,
    archivos:Object.fromEntries(contenido.map(([archivo,datos])=>[archivo,createHash('sha256').update(datos).digest('hex')]))},null,2)+'\n')
  console.log('Práctica preparada: '+destino+'\nAbrí EMPEZAR-AQUI.md. No se iniciaron servicios ni se enviaron transacciones.')
  return {destino,creado:true}
}
if(process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await prepararTestnet(process.argv.slice(2)) }
  catch(error) { console.error(error.message); process.exitCode=1 }
}
