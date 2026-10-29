import {readFile, mkdir, writeFile} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'
import {Contract, getAddress, keccak256} from 'ethers'
import {local, artefacto} from './comun.mjs'

// Contador no recibe argumentos en su constructor. La comparación de creation
// bytecode no sirve sin adaptación para otros constructores o proxies.
export async function verificarDeployment(provider, registro, artifact) {
  const chainId = (await provider.getNetwork()).chainId
  if (chainId !== 31337n || String(registro.chainId) !== String(chainId)) {
    throw Error('La red del registro debe coincidir con la red local 31337.')
  }
  const direccion = getAddress(registro.contador)
  const receipt = await provider.getTransactionReceipt(registro.contadorTransactionHash)
  if (!receipt || receipt.status !== 1 || !receipt.contractAddress || getAddress(receipt.contractAddress) !== direccion) {
    throw Error('El receipt no acredita la creación exitosa de la instancia registrada.')
  }
  const tx = await provider.getTransaction(registro.contadorTransactionHash)
  if (!tx || tx.to !== null || tx.data.toLowerCase() !== artifact.bytecode.toLowerCase()) {
    throw Error('El bytecode de creación no coincide con el artifact de Contador.')
  }
  const codigo = await provider.getCode(direccion)
  if (codigo === '0x') throw Error('La dirección no contiene código en esta sesión.')
  const contador = new Contract(direccion, artifact.abi, provider)
  const propietario = await contador.propietario()
  if (getAddress(propietario) !== getAddress(receipt.from)) throw Error('El propietario no coincide con la cuenta que creó Contador.')
  return {
    chainId: String(chainId), direccion, transactionHash: receipt.hash,
    bloque: receipt.blockNumber, status: receipt.status,
    cuentaDeployment: receipt.from, codigoPresente: true,
    creationBytecodeCoincide: true, runtimeCodeHash: keccak256(codigo),
    propietario, valor: String(await contador.valor()),
    alcance: 'Contador local sin argumentos de constructor. No es una auditoría de seguridad.'
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let provider
  try {
    provider = await local()
    const registro = JSON.parse(await readFile(new URL('../ui/despliegue.json', import.meta.url), 'utf8'))
    const resultado = await verificarDeployment(provider, registro, await artefacto('Contador'))
    await mkdir('resultados', {recursive: true})
    await writeFile('resultados/verificacion-deployment.json', JSON.stringify(resultado, null, 2) + '\n')
    console.log(JSON.stringify(resultado, null, 2))
    console.log('Evidencia guardada en resultados/verificacion-deployment.json')
  } catch {
    console.error('No se verificó el deployment. Comprobá el nodo local, chainId 31337, artifacts y registro actualizado. Después de reiniciar el nodo, desplegá otra vez. No se envió ninguna transacción.')
    process.exitCode = 1
  } finally {
    provider?.destroy()
  }
}
