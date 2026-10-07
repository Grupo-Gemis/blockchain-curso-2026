import {JsonRpcProvider, BrowserProvider, Contract} from '/vendor/ethers.js'
import {enviarYConfirmar} from './cliente.js'

const $ = id => document.getElementById(id)
const estado = mensaje => { $('estado').textContent = mensaje }
let contrato, proveedor, contexto = 0, ocupado = false, usaWallet = false

function habilitar() {
  for (const id of ['leer', 'sumar', 'reset']) $(id).disabled = ocupado || !contrato
  for (const id of ['local', 'wallet', 'cuenta']) $(id).disabled = ocupado
}
function invalidar() {
  contexto++
  contrato = undefined
  ocupado = false
  $('valor').textContent = '—'
  $('red').textContent = 'Reconexión necesaria'
  habilitar()
}
const mensajeError = e => e.revert?.name || e.shortMessage || e.message
const falloRPC = e => ['NETWORK_ERROR','SERVER_ERROR','TIMEOUT'].includes(e.code) ||
  /ECONNREFUSED|Failed to fetch|fetch failed|NetworkError/i.test(e.message || '') ||
  e.info?.error?.code === 'ECONNREFUSED'

async function leer(instancia, version) {
  const valor = await instancia.valor()
  if (version === contexto) $('valor').textContent = valor.toString()
}
async function conectar(wallet) {
  invalidar()
  const version = contexto
  usaWallet = wallet
  ocupado = true
  habilitar()
  let nuevoProveedor
  try {
    proveedor?.destroy()
    proveedor = undefined
    const response = await fetch('/despliegue.json')
    if (!response.ok) throw Error('Primero ejecutá npm run desplegar.')
    const config = await response.json()
    if (wallet && !window.ethereum) throw Error('No hay wallet disponible. Podés usar las cuentas locales.')
    nuevoProveedor = wallet ? new BrowserProvider(window.ethereum) : new JsonRpcProvider('http://127.0.0.1:8545')
    if (wallet) await nuevoProveedor.send('eth_requestAccounts', [])
    const red = await nuevoProveedor.getNetwork()
    if (red.chainId !== 31337n || BigInt(config.chainId) !== red.chainId) throw Error('Seleccioná la red local 31337 y un registro correspondiente a esa red.')
    if (await nuevoProveedor.getCode(config.contador) === '0x') throw Error('No existe el contrato en esta sesión. Volvé a desplegar y recargá la página.')
    const signer = await nuevoProveedor.getSigner(wallet ? undefined : Number($('cuenta').value))
    const nuevaInstancia = new Contract(config.contador, config.abi, signer)
    const cuenta = await signer.getAddress()
    const valor = await nuevaInstancia.valor()
    if (version !== contexto) { nuevoProveedor.destroy(); return }
    proveedor = nuevoProveedor
    contrato = nuevaInstancia
    $('red').textContent = `Red ${red.chainId} · Contrato ${config.contador} · Cuenta ${cuenta}`
    $('valor').textContent = valor.toString()
    estado('Conexión lista.')
  } catch (e) {
    nuevoProveedor?.destroy()
    if (version === contexto) {
      invalidar()
      estado(falloRPC(e) ? 'No se pudo conectar con el RPC local. Revisá el nodo y reconectá.' : mensajeError(e))
    }
  } finally {
    if (version === contexto) { ocupado = false; habilitar() }
  }
}
$('local').onclick = () => conectar(false)
$('wallet').onclick = () => conectar(true)
$('cuenta').onchange = () => { invalidar(); estado('Reconectá con la cuenta local seleccionada.') }
$('leer').onclick = async () => {
  const version = contexto, instancia = contrato
  ocupado = true
  habilitar()
  try {
    await leer(instancia, version)
    if (version === contexto) estado('Valor actualizado.')
  } catch (e) {
    if (version === contexto) {
      invalidar()
      estado(falloRPC(e) ? 'No se pudo conectar con el RPC local. Reconectá cuando el nodo esté activo.' : `Consulta fallida: ${mensajeError(e)}. Revisá el deployment y reconectá.`)
    }
  } finally {
    if (version === contexto) { ocupado = false; habilitar() }
  }
}
for (const [id, metodo] of [['sumar','incrementar'], ['reset','reiniciar']]) $(id).onclick = async () => {
  const version = contexto, instancia = contrato
  let recibo
  ocupado = true
  habilitar()
  try {
    recibo = await enviarYConfirmar(() => instancia[metodo](), mensaje => {
      if (version === contexto) estado(mensaje)
    })
    if (version === contexto) await leer(instancia, version)
  } catch (e) {
    if (version === contexto) {
      if (falloRPC(e) || recibo) invalidar()
      estado(recibo ? 'Transacción confirmada. No se pudo actualizar la lectura. Reconectá y consultá antes de reenviar.' :
        falloRPC(e) ? 'No se pudo completar la operación por el RPC. Comprobá su resultado antes de reenviar y reconectá.' :
        `Operación rechazada o fallida: ${mensajeError(e)}`)
    }
  } finally {
    if (version === contexto) { ocupado = false; habilitar() }
  }
}
for (const [evento, mensaje] of [['accountsChanged','Cambió la cuenta. Reconectá la wallet.'], ['chainChanged','Cambió la red. Reconectá la wallet.'], ['disconnect','La wallet se desconectó. Reconectá antes de operar.']]) {
  window.ethereum?.on?.(evento, () => {
    if (usaWallet) { invalidar(); estado(mensaje) }
  })
}
