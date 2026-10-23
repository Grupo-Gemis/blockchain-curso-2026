import {JsonRpcProvider,BrowserProvider,Contract,ContractFactory,formatEther,formatUnits,isAddress,isHexString} from '/vendor/ethers.js'
import {comprobarRed,observar,comparar,historia} from './observacion.js'
const $=id=>document.getElementById(id)
let proveedor,firmante,instancia,artifact,contexto=0,ocupado=false,actualizando=false
let configuracion={},observaciones=[],eventos=[],redConectada
const storage='utn-testnet-observable-v1-'
const mensaje=texto=>{$('estado').textContent=texto}
function controles() {
  for(const id of ['desplegar','abrir','observar','comparar']) $(id).disabled=ocupado||!firmante
  for(const id of ['leer','incrementar','reiniciar','revertir','historia']) $(id).disabled=ocupado||!instancia
  $('conectar').disabled=ocupado
}
function limpiarLectura(conservarEstimacion=false) {
  instancia=undefined; $('valor').textContent='—'; $('propietario').textContent='—'
  $('recibo').replaceChildren(); $('eventos').replaceChildren(); $('enlaces').replaceChildren()
  $('historico').textContent=''; $('rango').textContent='Consultá los eventos de la instancia comprobada.'
  $('contraste').textContent=''; if(!conservarEstimacion) $('estimacion').textContent='La estimación previa aparecerá aquí.'
  eventos=[]
}
function invalidar(texto) {
  contexto++; ocupado=false; actualizando=false; firmante=undefined; redConectada=undefined
  proveedor?.destroy(); proveedor=undefined; limpiarLectura()
  $('red').textContent='Sin conexión'; $('direccion-cuenta').textContent='—'; $('saldo').textContent='—'
  controles(); mensaje(texto)
}
function guardar() {
  try { localStorage.setItem(storage+redConectada,JSON.stringify(configuracion)) } catch {}
}
function restaurar() {
  try {configuracion=JSON.parse(localStorage.getItem(storage+$('modo').value)||'{}')} catch {configuracion={}}
  $('contrato').value=configuracion.contrato||''; $('creacion').value=configuracion.creacion||''; $('hash').value=configuracion.hash||''
}
function cambioModo() {
  invalidar('Conectá a la red seleccionada.'); restaurar()
  const local=$('modo').value==='31337'; $('cuentas-locales').hidden=!local
  $('alcance').textContent=local?'Ensayo local: un proceso de desarrollo produce los bloques. Este modo no reproduce el consenso PoS.':
    'Sepolia: red pública de prueba con PoS y validadores restringidos. Cada envío requiere tu firma en la wallet. No uses fondos de mainnet.'
}
function errorVisible(error) {
  if(error.code===4001||error.code==='ACTION_REJECTED') return 'Firma o conexión cancelada. No se observó un envío desde esta acción.'
  if(error.code==='CALL_EXCEPTION') return 'La simulación o ejecución fue rechazada. Revisá el permiso y el recibo si ya hay un hash.'
  if(error.message?.startsWith('Práctica:')) return error.message.slice(10)
  return 'No se completó la consulta u operación. Revisá conexión, red, saldo y datos. Si ya hay un hash, consultalo antes de reenviar.'
}
async function ejecutar(accion) {
  if(ocupado) return
  ocupado=true; controles(); const version=contexto
  try {await accion(version)} catch(error) {if(version===contexto) mensaje(errorVisible(error))}
  finally {if(version===contexto){ocupado=false;controles()}}
}
async function cargarArtifact() {
  const respuesta=await fetch('/artefacto.json')
  if(!respuesta.ok) throw Error('Práctica: ejecutá npm run compilar antes de conectar.')
  return respuesta.json()
}
async function conectar(version) {
  const red=BigInt($('modo').value),local=red===31337n
  let nuevo
  try {
    artifact=await cargarArtifact()
    if(!local&&!window.ethereum) throw Error('Práctica: abrí esta página en un navegador con wallet y seleccioná Sepolia.')
    nuevo=local?new JsonRpcProvider('http://127.0.0.1:19745',undefined,{cacheTimeout:-1}):new BrowserProvider(window.ethereum,undefined,{cacheTimeout:-1})
    if(!local) await nuevo.send('eth_requestAccounts',[])
    comprobarRed((await nuevo.getNetwork()).chainId,red)
    const signer=await nuevo.getSigner(local?Number($('cuenta').value):undefined)
    const cuenta=await signer.getAddress(),saldo=await nuevo.getBalance(cuenta)
    if(version!==contexto){nuevo.destroy();return}
    proveedor?.destroy(); limpiarLectura(); proveedor=nuevo; firmante=signer; redConectada=red.toString()
    $('red').textContent=local?'31337 · ensayo local':'11155111 · Sepolia'
    $('direccion-cuenta').textContent=cuenta; $('saldo').textContent=formatEther(saldo)+(local?' ETH ficticios locales':' ETH de prueba')
    mensaje('Conexión comprobada. Creá una instancia o comprobá los datos de una existente.')
  } catch(error) {if(nuevo!==proveedor) nuevo?.destroy();throw error}
}
async function redVigente() {
  if(!proveedor||!firmante) throw Error('Práctica: conectá antes de operar.')
  comprobarRed((await proveedor.getNetwork()).chainId,redConectada)
}
async function abrir(version) {
  await redVigente()
  const direccion=$('contrato').value.trim(),hash=$('creacion').value.trim(),p=proveedor,signer=firmante
  if(!isAddress(direccion)||!isHexString(hash,32)) throw Error('Práctica: indicá una dirección y un hash de creación válidos.')
  const [r,tx,codigo]=await Promise.all([p.getTransactionReceipt(hash),p.getTransaction(hash),p.getCode(direccion)])
  if(!r||r.status!==1||r.contractAddress?.toLowerCase()!==direccion.toLowerCase()||tx?.to!=null||
    tx?.data.toLowerCase()!==artifact.bytecode.toLowerCase()||codigo==='0x') throw Error('Práctica: los datos no identifican una creación vigente de este Contador. Revisá red, hash, dirección y compilación.')
  const c=new Contract(direccion,artifact.abi,signer),propietario=await c.propietario(),valor=await c.valor()
  if(propietario.toLowerCase()!==tx.from.toLowerCase()) throw Error('Práctica: el propietario no coincide con el creador.')
  if(version!==contexto) return
  instancia=c; configuracion={...configuracion,contrato:direccion,creacion:hash,bloqueCreacion:r.blockNumber}
  if(!$('hash').value.trim()) {$('hash').value=hash;configuracion.hash=hash}
  $('valor').textContent=valor.toString(); $('propietario').textContent=propietario; guardar();controles()
  mensaje('Instancia comprobada. Podés consultar y enviar operaciones.')
}
async function enviar(accion,version) {
  await redVigente()
  const signer=firmante,p=proveedor,red=redConectada
  let solicitud,estimado
  if(accion==='crear') {
    const f=new ContractFactory(artifact.abi,artifact.bytecode,signer)
    solicitud=await f.getDeployTransaction(); estimado=await signer.estimateGas(solicitud)
  } else {
    if(!instancia) throw Error('Práctica: comprobá una instancia primero.')
    const metodo=accion==='incrementar'?'incrementar':'reiniciar'
    solicitud=await instancia[metodo].populateTransaction()
    if(accion==='revertir') {
      if((await signer.getAddress()).toLowerCase()===(await instancia.propietario()).toLowerCase()) throw Error('Práctica: este experimento requiere una cuenta distinta del propietario.')
    } else estimado=await signer.estimateGas(solicitud)
  }
  if(version!==contexto) return
  solicitud.gasLimit=accion==='revertir'?100000n:estimado*120n/100n
  $('estimacion').textContent=accion==='revertir'?'Sin estimación exitosa: envío deliberado con límite de 100.000 gas.':
    'Estimación previa: '+estimado+' gas. Límite solicitado: '+solicitud.gasLimit+' gas. El recibo dará el consumo efectivo.'
  mensaje(red==='31337'?'Enviando al nodo local…':'Revisá red, operación y comisión en la wallet. Esperando tu firma…')
  // Volver a comprobar tras las consultas previas y antes de pedir la firma.
  comprobarRed((await p.getNetwork()).chainId,red)
  if(version!==contexto) return
  const tx=await signer.sendTransaction(solicitud)
  // Conservar el hash incluso si el contexto cambió mientras la wallet estaba abierta.
  observaciones.push({red,accion,hash:tx.hash,gasEstimado:estimado?.toString()??null,gasLimitSolicitado:solicitud.gasLimit.toString(),observado:new Date().toISOString(),estado:'Enviada, falta consultar recibo'})
  if(version!==contexto) return
  configuracion.hash=tx.hash; $('hash').value=tx.hash
  if(accion==='crear') {limpiarLectura(true);configuracion={hash:tx.hash,creacion:tx.hash};$('contrato').value='';$('creacion').value=tx.hash}
  guardar(); mensaje('Enviada: '+tx.hash+'. Esperando un recibo.'); await actualizar(version)
}
function celda(texto,tag='td') {const e=document.createElement(tag);e.textContent=texto;return e}
function mostrarRecibo(r) {
  const panel=$('recibo');panel.replaceChildren();$('enlaces').replaceChildren()
  if(r.pendiente){mensaje(r.alcance);return}
  const gwei=v=>v==null?'No informado':formatUnits(v,'gwei')+' gwei/gas'
  const campos=[['Ejecución',r.resultado],['Bloque',String(r.bloque)],['Hash del bloque',r.blockHash],
    ['Inclusión canónica',r.canonico?'Comprobada en este acceso':'Sin comprobar o cambió el bloque'],
    ['Confirmaciones',String(r.confirmaciones)],['Finalización',r.finalidad],
    ['Gas consumido',r.gasUsed+' gas'],['Límite autorizado',r.gasLimit? r.gasLimit+' gas':'No informado'],
    ['Precio efectivo',gwei(r.precioWei)],['Comisión',formatEther(r.comisionWei)+' ETH'+(redConectada==='11155111'?' de prueba':' ficticios locales')],
    ['Base del bloque',gwei(r.baseFeePerGas)],['Propina efectiva',gwei(r.propinaWeiPorGas)],
    ['Máximo por gas',gwei(r.maxFeePerGas)],['Propina máxima',gwei(r.maxPriorityFeePerGas)],['Value solicitado',r.valueWei==null?'No informado':formatEther(r.valueWei)+' ETH']]
  for(const [nombre,valor] of campos) panel.append(celda(nombre,'dt'),celda(valor,'dd'))
  if(redConectada==='11155111') for(const [texto,url] of [['Ver transacción','https://sepolia.etherscan.io/tx/'+r.hash],['Ver bloque','https://sepolia.etherscan.io/block/'+r.bloque]]) {
    const enlace=document.createElement('a');enlace.textContent=texto;enlace.href=url;enlace.target='_blank';enlace.rel='noopener noreferrer';$('enlaces').append(enlace)
  }
  mensaje(r.resultado+'. '+r.finalidad+'.')
}
async function actualizar(version=contexto) {
  if(!proveedor||actualizando) return
  const hash=$('hash').value.trim(),p=proveedor,red=redConectada
  if(!isHexString(hash,32)) throw Error('Práctica: indicá un hash válido de 32 bytes.')
  actualizando=true
  try {
    const r=await observar(p,hash,red)
    if(version!==contexto) return
    configuracion.hash=hash;guardar(); mostrarRecibo(r)
    observaciones.push({red,instanciaAbierta:configuracion.contrato||null,observado:new Date().toISOString(),...r})
    if(!r.pendiente&&hash===configuracion.creacion&&r.status===1&&r.contractAddress&&!instancia) {
      $('contrato').value=r.contractAddress; await abrir(version)
      if(version===contexto) mostrarRecibo(r)
    }
    if(instancia) {
      const [valor,saldo]=await Promise.all([instancia.valor(),p.getBalance(await firmante.getAddress())])
      if(version===contexto){$('valor').textContent=valor.toString();$('saldo').textContent=formatEther(saldo)+(red==='11155111'?' ETH de prueba':' ETH ficticios locales')}
    }
  } finally {if(version===contexto) actualizando=false}
}
async function cargarHistoria(version) {
  await redVigente(); const c=instancia,p=proveedor
  const datos=await historia(c,configuracion.bloqueCreacion,await p.getBlockNumber())
  if(version!==contexto) return
  eventos=datos.eventos; $('eventos').replaceChildren()
  $('rango').textContent='Eventos exitosos entre bloques '+datos.desde+' y '+datos.hasta+'. '+(datos.parcial?'Ventana parcial de hasta 5.000 bloques. No representa toda la historia.':'Desde la creación comprobada.')+' Una reversión no agrega ValorCambiado.'
  for(const e of eventos) {
    const fila=document.createElement('tr'); fila.append(celda(e.bloque),celda(e.autor),celda(e.valor),celda(e.hash))
    const ultima=celda(''),boton=document.createElement('button');boton.className='secondary';boton.textContent='Leer bloque '+e.bloque
    boton.onclick=()=>ejecutar(async(v)=>{const valor=await c.valor({blockTag:e.bloque});if(v===contexto)$('historico').textContent='Valor al final del bloque '+e.bloque+': '+valor+'. Puede incluir otras transacciones del mismo bloque.'})
    ultima.append(boton);fila.append(ultima);$('eventos').append(fila)
  }
}
$('conectar').onclick=()=>{invalidar('Comprobando conexión…');ejecutar(conectar)}
$('modo').onchange=cambioModo
$('cuenta').onchange=()=>invalidar('Cambió la cuenta local. Reconectá y comprobá la instancia conservada.')
$('abrir').onclick=()=>ejecutar(abrir)
for(const [id,accion] of [['desplegar','crear'],['incrementar','incrementar'],['reiniciar','reiniciar'],['revertir','revertir']]) $(id).onclick=()=>ejecutar(v=>enviar(accion,v))
$('leer').onclick=()=>ejecutar(async v=>{await redVigente();const valor=await instancia.valor();if(v===contexto){$('valor').textContent=valor.toString();mensaje('Consulta realizada. No se envió una transacción.')}})
$('observar').onclick=()=>ejecutar(actualizar)
$('historia').onclick=()=>ejecutar(cargarHistoria)
$('comparar').onclick=()=>ejecutar(async version=>{
  const url=new URL($('testigo').value),hash=$('hash').value.trim()
  if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash) throw Error('Práctica: usá un RPC público HTTPS sin usuario, contraseña, parámetros ni fragmentos. No pegues tokens en la ruta.')
  if(!isHexString(hash,32)) throw Error('Práctica: indicá un hash válido para comparar.')
  const testigo=new JsonRpcProvider(url.href,undefined,{cacheTimeout:-1})
  try {const resultado=await comparar(proveedor,testigo,hash,redConectada);if(version===contexto){$('contraste').textContent=resultado.mensaje;observaciones.push({red:redConectada,hash,observado:new Date().toISOString(),contraste:resultado})}}
  finally {testigo.destroy()}
})
$('exportar').onclick=()=>{
  const informe={version:1,exportado:new Date().toISOString(),red:redConectada||$('modo').value,instancia:configuracion,
    observaciones,eventos,alcance:'Observaciones locales o de Sepolia. No demuestra auditoría, independencia de proveedores ni inspección de todos los votos de consenso.'}
  const enlace=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(informe,null,2)],{type:'application/json'}))
  enlace.href=url;enlace.download='evidencia-testnet-'+informe.red+'.json';enlace.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
}
for(const evento of ['accountsChanged','chainChanged','disconnect']) window.ethereum?.on?.(evento,()=>{
  if($('modo').value==='11155111') invalidar('Cambió la cuenta, la red o la conexión de la wallet. Reconectá y comprobá la instancia antes de operar.')
})
setInterval(()=>{if($('automatico').checked&&proveedor&&!ocupado&&isHexString($('hash').value.trim(),32)) actualizar().catch(()=>mensaje('No se pudo actualizar el seguimiento. Conservá el hash y consultá antes de reenviar.'))},12000)
cambioModo()
