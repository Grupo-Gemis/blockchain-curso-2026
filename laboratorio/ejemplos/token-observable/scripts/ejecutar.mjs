import {spawn, execFileSync} from 'node:child_process'
import {readdirSync, existsSync} from 'node:fs'
import {homedir} from 'node:os'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const raiz = fileURLToPath(new URL('../', import.meta.url))
const tareas = {iniciar:['scripts/iniciar.mjs'],preparar:['scripts/preparar.mjs'],compilar:['node_modules/hardhat/dist/src/cli.js','build'],probar:['scripts/probar.mjs'],recorrido:['scripts/recorrido.mjs']}
function compatible(version) {
  const [mayor, menor] = version.replace(/^v/, '').split('.').map(Number)
  return mayor % 2 === 0 && mayor >= 24
}
try {
  const tarea = tareas[process.argv[2]]
  if (!tarea) throw Error('Tarea desconocida.')
  let node = process.execPath
  if (!compatible(process.versions.node)) {
    const carpeta = path.join(process.env.NVM_DIR || path.join(homedir(), '.nvm'), 'versions/node')
    const versiones = existsSync(carpeta) ? readdirSync(carpeta).filter(v => /^v24\./.test(v)).sort((a,b) => b.localeCompare(a, undefined, {numeric:true})) : []
    node = versiones.map(v => path.join(carpeta, v, 'bin/node')).find(p => existsSync(p))
    if (!node || !compatible(execFileSync(node, ['--version'], {encoding:'utf8'}).trim())) {
      throw Error('Se necesita Node.js 24 LTS. Con nvm: nvm install 24. Después repetí este comando.')
    }
    console.log('Usando Node 24 instalado con nvm para este laboratorio.')
  }
  const hijo = spawn(node, [...tarea, ...process.argv.slice(3)], {
    cwd:raiz, stdio:'inherit', env:{...process.env, PATH:path.dirname(node) + path.delimiter + process.env.PATH}
  })
  for (const señal of ['SIGINT','SIGTERM']) process.on(señal, () => hijo.kill(señal))
  hijo.once('error', error => {console.error(error.message);process.exitCode=1})
  hijo.once('exit', (codigo, señal) => {process.exitCode=codigo ?? (señal === 'SIGINT' ? 0 : 1)})
} catch (error) { console.error(error.message); process.exitCode=1 }
