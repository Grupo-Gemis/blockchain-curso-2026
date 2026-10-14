import {readFile} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'
import {Contract} from 'ethers'
import {local,artefacto} from './comun.mjs'
import {verificarDeployment} from './verificar-deployment.mjs'

// Cliente de la instancia existente. No completa las funciones del contrato.
export function argumentos(args) {
  const [metodo,flag,cuenta,...extra]=args
  if (!['incrementar','reiniciar'].includes(metodo) || flag!=='--cuenta' || !['0','1'].includes(cuenta) || extra.length) {
    throw Error('Uso: npm run usar:contador -- incrementar|reiniciar --cuenta 0|1. A es 0, B es 1.')
  }
  return {metodo,cuenta:Number(cuenta)}
}

export async function usarContador(provider,registro,artifact,{metodo,cuenta},informar=console.log) {
  const evidencia=await verificarDeployment(provider,registro,artifact)
  const signer=await provider.getSigner(cuenta)
  const contrato=new Contract(evidencia.direccion,artifact.abi,signer)
  informar('Red: '+evidencia.chainId)
  informar('Contrato: '+evidencia.direccion)
  informar('Cuenta: '+await signer.getAddress()+' ('+(cuenta===0?'A · Ana':'B · Bruno')+')')
  informar('Valor antes: '+evidencia.valor)
  let tx
  try { tx=await contrato[metodo]() }
  catch(error) {
    // El RPC puede devolver solo los datos del error personalizado.
    const datos=error.data || error.info?.error?.data?.data || error.info?.error?.data
    let rechazo
    if (error.code==='CALL_EXCEPTION' && typeof datos==='string') {
      try { rechazo=contrato.interface.parseError(datos) } catch {}
    }
    if (rechazo) throw Error('El contrato rechazó la operación: '+rechazo.name, {cause:error})
    throw error
  }
  informar('Enviada: '+tx.hash)
  informar('Esperando el recibo…')
  const recibo=await tx.wait()
  if (!recibo || recibo.status!==1) throw Error('No se obtuvo un recibo de ejecución exitosa.')
  const valor=String(await contrato.valor())
  informar('Recibo: status '+recibo.status+' · bloque '+recibo.blockNumber)
  informar('Valor después: '+valor)
  return {chainId:evidencia.chainId,direccion:evidencia.direccion,cuenta:await signer.getAddress(),hash:tx.hash,status:recibo.status,valorAntes:evidencia.valor,valorDespues:valor}
}

if (process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  let provider
  try {
    const opciones=argumentos(process.argv.slice(2))
    provider=await local()
    const registro=JSON.parse(await readFile(new URL('../ui/despliegue.json',import.meta.url),'utf8'))
    await usarContador(provider,registro,await artefacto('Contador'),opciones)
  } catch(error) {
    console.error('Operación o comprobación no completada:',error.revert?.name || error.shortMessage || error.message)
    console.error('Para revisar el estado, ejecutá npm run consultar. Si hubo un envío, conservá su hash y comprobá el resultado antes de repetirlo.')
    process.exitCode=1
  } finally { provider?.destroy() }
}
