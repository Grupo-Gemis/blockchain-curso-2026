import {readFile, writeFile, mkdir, readdir} from 'node:fs/promises'
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
  const original = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
  const paquete = {...original, name:'blockchain-testnet-observable', scripts:{
    compilar:'hardhat build', nodo:'hardhat node --network hardhatMainnet --hostname 127.0.0.1 --port 19745',
    interfaz:'node scripts/interfaz.mjs', test:'node scripts/probar.mjs'
  }}
  contenido.push(['package.json', Buffer.from(JSON.stringify(paquete,null,2)+'\n')])
  contenido.push(['package-lock.json', await readFile(path.join(root,'package-lock.json'))])
  contenido.push(['.gitignore', Buffer.from('node_modules/\nartifacts/\ncache/\nresultados/\n.env\n.env.*\n!.env.example\n')])
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
  }
  await writeFile(path.join(destino,'guiado.json'),JSON.stringify({tipo:'testnet-observable',version:1,
    archivos:Object.fromEntries(contenido.map(([archivo,datos])=>[archivo,createHash('sha256').update(datos).digest('hex')]))},null,2)+'\n')
  console.log('Práctica preparada: '+destino+'\nAbrí EMPEZAR-AQUI.md. No se iniciaron servicios ni se enviaron transacciones.')
  return {destino,creado:true}
}
if(process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await prepararTestnet(process.argv.slice(2)) }
  catch(error) { console.error(error.message); process.exitCode=1 }
}
