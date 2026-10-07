import {mkdir, writeFile} from 'node:fs/promises'
import {local, desplegar, artefacto} from './comun.mjs'

const provider = await local()
try {
  const signer = await provider.getSigner(0)
  const contador = await desplegar('Contador', signer)
  const registro = {
    chainId: 31337,
    contadorTransactionHash: contador.deploymentTransaction().hash,
    contador: await contador.getAddress(),
    abi: (await artefacto('Contador')).abi
  }
  await mkdir('ui', {recursive: true})
  await writeFile('ui/despliegue.json', JSON.stringify(registro, null, 2) + '\n')
  console.log('Red local:', registro.chainId)
  console.log('Contador:', registro.contador)
  console.log('Creación:', registro.contadorTransactionHash)
  console.log('Configuración actualizada: ui/despliegue.json')
} finally {
  provider.destroy()
}
