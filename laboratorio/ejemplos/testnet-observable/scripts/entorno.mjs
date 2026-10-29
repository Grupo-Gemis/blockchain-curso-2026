import {spawn} from 'node:child_process'
import {existsSync} from 'node:fs'
import {fileURLToPath} from 'node:url'

export const raiz = fileURLToPath(new URL('../', import.meta.url))
export function verificarNode() {
  const [mayor, menor] = process.versions.node.split('.').map(Number)
  if (mayor < 22 || (mayor === 22 && menor < 13) || mayor % 2 !== 0) {
    throw Error(`Node ${process.versions.node} no es compatible. Usá Node 24 LTS. Con nvm: nvm install 24 y nvm use 24.`)
  }
}
export function npm(argumentos) {
  const ejecutable = process.env.npm_execpath
  const proceso = ejecutable
    ? spawn(process.execPath, [ejecutable, ...argumentos], {cwd: raiz, stdio: 'inherit'})
    : spawn('npm', argumentos, {cwd: raiz, stdio: 'inherit'})
  return new Promise((resolve, reject) => {
    proceso.once('error', reject)
    proceso.once('exit', code => code === 0 ? resolve() : reject(Error(`Falló npm ${argumentos.join(' ')}. Revisá el mensaje anterior.`)))
  })
}
export async function dependencias() {
  verificarNode()
  if (!existsSync(raiz + 'node_modules/hardhat/dist/src/cli.js') || !existsSync(raiz + 'node_modules/ethers/package.json')) {
    console.log('Instalando las dependencias fijadas en package-lock.json…')
    await npm(['ci'])
  }
}
