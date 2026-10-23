import {Contract, JsonRpcProvider, keccak256} from '/vendor/ethers.js';
const $ = id => document.getElementById(id);
const proveedor = new JsonRpcProvider(new URL('/rpc', location.href).href, undefined, {cacheTimeout: -1});
proveedor.pollingInterval = 250;
let contrato, ocupado = false, version = 0;
const estados = ['Inexistente', 'Vigente', 'Revocado'];
function controles() {
  document.querySelectorAll('[data-chain]').forEach(b => { b.disabled = ocupado || !contrato; });
  for (const id of ['cuenta', 'archivo', 'huella', 'conectar']) $(id).disabled = ocupado;
}
function invalidar() {
  version++; contrato = undefined; $('contexto').hidden = true;
  $('conexion').textContent = 'Sin conexión. Volvé a conectar para usar la cuenta seleccionada.';
  $('resultado').textContent = 'Estado del registro todavía no consultado.';
  $('recibo').textContent = ''; controles();
}
function huella() {
  const texto = $('huella').value.trim();
  if (!/^0x[0-9a-fA-F]{64}$/.test(texto)) throw Error('Elegí un archivo o ingresá una huella de 32 bytes con prefijo 0x.');
  return texto;
}
function explicar(error) {
  const nombre = error.revert?.name;
  if (nombre) return nombre;
  const candidatos = [error.data, error.info?.error?.data?.data, error.info?.error?.data];
  for (const dato of candidatos) {
    try { if (typeof dato === 'string') return contrato.interface.parseError(dato).name; } catch {}
  }
  return error.shortMessage || error.message || 'No se pudo completar la solicitud.';
}
async function consultar(clave, contexto = version) {
  const [emisor, estado] = await contrato.consultar(clave);
  if (contexto !== version) return;
  $('resultado').textContent = Number(estado) === 0 ? 'Inexistente: no hay un registro para esta huella en esta instancia.' : estados[Number(estado)] + '. Emisor: ' + emisor;
}
$('cuenta').addEventListener('change', invalidar);
$('huella').addEventListener('input', () => { version++; $('archivo').value = ''; $('archivo-elegido').textContent = 'Huella ingresada manualmente. No se comprobó su correspondencia con un archivo.'; $('operacion').textContent = 'Huella cambiada. Consultá nuevamente el registro.'; $('resultado').textContent = 'Estado del registro todavía no consultado.'; $('recibo').textContent = ''; });
$('archivo').addEventListener('change', async () => {
  const actual = ++version, archivo = $('archivo').files[0];
  $('huella').value = ''; $('operacion').textContent = 'Archivo cambiado. Calculando su huella antes de consultar.'; $('resultado').textContent = 'Estado del registro todavía no consultado.'; $('recibo').textContent = '';
  if (!archivo) { $('archivo-elegido').textContent = 'Ningún archivo seleccionado.'; return; }
  const digest = await crypto.subtle.digest('SHA-256', await archivo.arrayBuffer());
  if (actual !== version) return;
  $('huella').value = '0x' + Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
  $('archivo-elegido').textContent = archivo.name + ' · ' + archivo.size + ' bytes. Huella calculada localmente.';
});
$('conectar').addEventListener('click', async () => {
  ocupado = true; contrato = undefined; controles();
  $('contexto').hidden = true; $('resultado').textContent = 'Estado del registro todavía no consultado.';
  $('conexion').textContent = 'Comprobando red, recibo y código de la instancia…';
  try {
    const respuesta = await fetch('/despliegue.json');
    if (!respuesta.ok) throw Error('Falta el despliegue. Ejecutá npm run desplegar en la carpeta de certificados.');
    const registro = await respuesta.json();
    if (registro.chainId !== 31337 || (await proveedor.getNetwork()).chainId !== 31337n) throw Error('La red no coincide con la práctica.');
    const codigo = await proveedor.getCode(registro.direccion), recibo = await proveedor.getTransactionReceipt(registro.hash);
    if (codigo === '0x' || keccak256(codigo) !== registro.runtimeCodeHash || !recibo || recibo.status !== 1 || recibo.contractAddress?.toLowerCase() !== registro.direccion.toLowerCase()) throw Error('La instancia guardada no está disponible. Comprobá el nodo y el despliegue.');
    const firmante = await proveedor.getSigner(Number($('cuenta').value));
    contrato = new Contract(registro.direccion, registro.abi, firmante); version++;
    $('direccion').textContent = registro.direccion; $('actor').textContent = await firmante.getAddress();
    $('contexto').hidden = false; $('conexion').textContent = 'Conectado a la instancia comprobada.';
    $('operacion').textContent = 'Listo para consultar o solicitar una operación.';
  } catch (error) { $('conexion').textContent = 'No se pudo conectar: ' + explicar(error); }
  finally { ocupado = false; controles(); }
});
for (const accion of ['consultar', 'emitir', 'revocar']) $(accion).addEventListener('click', async () => {
  if (ocupado || !contrato) return;
  ocupado = true; controles();
  let enviada = false, confirmada = false;
  try {
    const clave = huella();
    if (accion === 'consultar') { await consultar(clave); $('operacion').textContent = 'Consulta completada. No se envió una transacción.'; return; }
    $('operacion').textContent = 'Solicitud de ' + accion + ' desde la cuenta local. Todavía no hay un resultado confirmado.';
    $('recibo').textContent = '';
    const tx = await contrato[accion](clave); enviada = true;
    $('operacion').textContent = 'Transacción enviada. Esperando el recibo…'; $('recibo').textContent = 'Hash: ' + tx.hash;
    const recibo = await tx.wait(1, 15000);
    if (!recibo || recibo.status !== 1) throw Error('La ejecución no terminó correctamente.');
    confirmada = true;
    $('operacion').textContent = 'Ejecución confirmada. Consultando el estado posterior…';
    $('recibo').textContent = 'Hash: ' + tx.hash + ' · gas consumido: ' + recibo.gasUsed;
    await consultar(clave); $('operacion').textContent = 'Ejecución confirmada y estado posterior consultado en la red local.';
  } catch (error) {
    $('operacion').textContent = accion === 'consultar' ? 'No se pudo consultar el registro. Comprobá la conexión y volvé a consultar. ' + explicar(error) : confirmada ? 'La ejecución tuvo éxito, pero falló la lectura posterior. Reconectá y consultá antes de reenviar.' : enviada ? 'No se pudo comprobar el resultado de la transacción enviada. Consultá por su hash antes de reenviar. ' + explicar(error) : 'Solicitud rechazada antes de obtener un envío: ' + explicar(error);
    $('resultado').textContent = 'La última solicitud no produjo una consulta nueva del estado. Volvé a consultar.';
  } finally { ocupado = false; controles(); }
});
async function disponibilidad() {
  const r = await fetch('/documentos/certificado-aula.txt');
  $('estado-archivo').textContent = r.ok ? 'Documento disponible en el servidor (HTTP 200). Esto no informa su vigencia.' : 'Documento no disponible (HTTP ' + r.status + '). Podés consultar el registro usando la huella guardada.';
}
for (const [id, valor] of [['ocultar', false], ['restaurar', true]]) $(id).addEventListener('click', async () => {
  try {
    const r = await fetch('/disponibilidad', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({disponible: valor})});
    if (!r.ok) throw Error('No se pudo cambiar la disponibilidad.');
    await disponibilidad();
  } catch (error) { $('estado-archivo').textContent = error.message; }
});
$('disponibilidad').addEventListener('click', () => disponibilidad().catch(error => { $('estado-archivo').textContent = error.message; }));
