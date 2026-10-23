// Funciones compartidas por la interfaz y las pruebas. No firman ni envían.
export function comprobarRed(observada, esperada) {
  if(![31337n,11155111n].includes(BigInt(esperada)) || BigInt(observada)!==BigInt(esperada)) throw Error('La red observada no coincide con la seleccionada. Reconectá antes de enviar.')
}
export function resumenRecibo(recibo, tx, bloque, altura, finalizado, local=false) {
  const canonico=!!bloque && bloque.hash?.toLowerCase()===recibo.blockHash?.toLowerCase()
  const gas=BigInt(recibo.gasUsed), precio=BigInt(recibo.gasPrice ?? recibo.effectiveGasPrice)
  const base=bloque?.baseFeePerGas == null ? null : BigInt(bloque.baseFeePerGas)
  return {
    hash:recibo.hash ?? recibo.transactionHash, bloque:recibo.blockNumber, blockHash:recibo.blockHash,
    resultado:Number(recibo.status)===1?'Ejecución exitosa':'Ejecución revertida', status:Number(recibo.status),
    canonico, confirmaciones:canonico?Math.max(0,Number(altura)-Number(recibo.blockNumber)+1):0,
    finalidad:local?'No se evalúa PoS en el ensayo local':!canonico?'Inclusión canónica sin comprobar':
      finalizado==null?'Finalización no disponible':Number(finalizado.number)>=Number(recibo.blockNumber)?'Bloque finalizado':'Esperando finalización',
    gasUsed:gas.toString(), gasLimit:tx?.gasLimit?.toString() ?? null,
    precioWei:precio.toString(), comisionWei:(gas*precio).toString(),
    maxFeePerGas:tx?.maxFeePerGas?.toString() ?? null,
    maxPriorityFeePerGas:tx?.maxPriorityFeePerGas?.toString() ?? null,
    baseFeePerGas:base?.toString() ?? null,
    propinaWeiPorGas:base==null?null:(precio>=base?precio-base:0n).toString(),
    valueWei:tx?.value?.toString() ?? null
  }
}
export async function observar(proveedor, hash, red) {
  comprobarRed((await proveedor.getNetwork()).chainId, red)
  const recibo=await proveedor.getTransactionReceipt(hash)
  if(!recibo) return {hash,pendiente:true,alcance:'Sin recibo observado. Puede estar pendiente, no difundida aquí o descartada. No reenviar automáticamente.'}
  const [tx,bloque,altura,finalizado]=await Promise.all([
    proveedor.getTransaction(hash), proveedor.getBlock(recibo.blockNumber), proveedor.getBlockNumber(),
    BigInt(red)===31337n?Promise.resolve(null):proveedor.getBlock('finalized').catch(()=>null)
  ])
  return {...resumenRecibo(recibo,tx,bloque,altura,finalizado,BigInt(red)===31337n),pendiente:false,contractAddress:recibo.contractAddress}
}
export async function comparar(proveedor, testigo, hash, red) {
  const [ra,rb]=await Promise.all([proveedor.getNetwork(),testigo.getNetwork()])
  comprobarRed(ra.chainId,red); comprobarRed(rb.chainId,red)
  const [a,b]=await Promise.all([proveedor.getTransactionReceipt(hash),testigo.getTransactionReceipt(hash)])
  if(!a||!b) return {coinciden:false,mensaje:'Algún acceso todavía no devuelve el recibo. Esto no demuestra una transacción inválida.'}
  const [ba,bb]=await Promise.all([proveedor.getBlock(a.blockNumber),testigo.getBlock(a.blockNumber)])
  const coinciden=a.blockHash===b.blockHash && ba?.hash===a.blockHash && bb?.hash===a.blockHash &&
    Number(a.status)===Number(b.status) && a.gasUsed.toString()===b.gasUsed.toString()
  return {coinciden,bloque:a.blockNumber,blockHash:a.blockHash,mensaje:coinciden?
    'Ambos accesos coinciden en bloque, recibo, resultado y gas. No es una prueba independiente de los votos de consenso.':
    'Los accesos difieren. Revisá sincronización, red y posible reorganización antes de concluir.'}
}
export async function historia(contrato, desde, hasta, maximo=5000) {
  desde=Number(desde); hasta=Number(hasta)
  if(!Number.isSafeInteger(desde)||!Number.isSafeInteger(hasta)||desde<0||hasta<desde) throw Error('Rango de historia inválido.')
  const inicio=Math.max(desde,hasta-maximo+1), eventos=[]
  for(let n=inicio;n<=hasta;n+=500) eventos.push(...await contrato.queryFilter(contrato.filters.ValorCambiado(),n,Math.min(n+499,hasta)))
  return {desde:inicio,hasta,parcial:inicio!==desde,eventos:eventos.map(e=>({
    bloque:e.blockNumber,hash:e.transactionHash,indice:e.index,autor:e.args.autor,valor:e.args.nuevoValor.toString()
  })).sort((a,b)=>a.bloque-b.bloque||a.indice-b.indice)}
}
