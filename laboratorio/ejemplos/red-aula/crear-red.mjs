import {readFile,writeFile,readdir} from 'node:fs/promises'
import {randomBytes} from 'node:crypto'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {makeManifest} from './pares.mjs'

export async function createNetwork(directory, output, name) {
  const files=(await readdir(directory)).filter(file=>file.endsWith('.json')).sort()
  const invitations=await Promise.all(files.map(file=>readFile(path.join(directory,file),'utf8').then(JSON.parse)))
  const manifest=makeManifest(invitations,randomBytes(16).toString('hex'),name)
  await writeFile(output,JSON.stringify(manifest,null,2)+'\n',{flag:'wx'})
  return manifest
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arg=(name,fallback)=>{const index=process.argv.indexOf(name);return index<0?fallback:process.argv[index+1]}
  const manifest=await createNetwork(arg('--invitaciones','invitaciones'),arg('--salida','red.json'),arg('--nombre','Red de aula'))
  console.log('Archivo común creado para ' + manifest.config.count + ' nodos. Quórum: ' + manifest.config.quorum + '.')
  console.log('Distribuí el mismo red.json a todos. Huella: ' + manifest.hash)
}
