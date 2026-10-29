import {readFile} from 'node:fs/promises'
import {Contract} from 'ethers'
import {local} from './comun.mjs'

let provider
try {
  provider = await local()
  const config = JSON.parse(await readFile(new URL('../ui/despliegue.json', import.meta.url), 'utf8'))
  if (String(config.chainId) !== String((await provider.getNetwork()).chainId)) {
    throw Error('El registro corresponde a otra red. Volvé a desplegar.')
  }
  const codigo = await provider.getCode(config.contador)
  if (codigo === '0x') throw Error('La dirección no contiene código. Volvé a desplegar después del reinicio.')
  const contador = new Contract(config.contador, config.abi, provider)
  console.log('Red:', config.chainId)
  console.log('Contador:', config.contador)
  console.log('Propietario:', await contador.propietario())
  console.log('Valor:', (await contador.valor()).toString())
} catch (error) {
  console.error('Consulta no completada:', error.shortMessage || error.message)
  process.exitCode = 1
} finally {
  provider?.destroy()
}
