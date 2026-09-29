// Fuente del ejemplo público de la unidad 1. No simula pagos de Bitcoin.
import {createHash} from 'node:crypto';

export const calcularHash = bloque => createHash('sha256')
  .update(JSON.stringify([bloque.indice, bloque.dato, bloque.anterior]), 'utf8')
  .digest('hex');

export function crearCadena() {
  const datos = [
    'Ana solicita pagar 70000 satoshis a la libreria',
    'Se registra el pago de Ana en el historial del ejemplo',
    'Se agrega una operacion posterior al historial'
  ];
  const cadena = [];
  datos.forEach((dato, indice) => {
    const bloque = {indice, dato, anterior: indice ? cadena[indice - 1].hash : '0'};
    bloque.hash = calcularHash(bloque);
    cadena.push(bloque);
  });
  return cadena;
}

export function verificar(cadena) {
  const errores = [];
  if (!cadena.length) errores.push('La cadena esta vacia.');
  cadena.forEach((bloque, indice) => {
    if (bloque.indice !== indice) errores.push(`Bloque ${indice}: indice incorrecto.`);
    if (bloque.hash !== calcularHash(bloque)) errores.push(`Bloque ${indice}: el hash guardado no coincide con sus datos.`);
    const esperado = indice ? cadena[indice - 1].hash : '0';
    if (bloque.anterior !== esperado) errores.push(`Bloque ${indice}: la referencia al bloque anterior no coincide.`);
  });
  return errores;
}

export function recalcular(cadena) {
  cadena.forEach((bloque, indice) => {
    bloque.anterior = indice ? cadena[indice - 1].hash : '0';
    bloque.hash = calcularHash(bloque);
  });
}

export function ejecutarEjemplo() {
  const cadena = crearCadena();
  const referenciaOriginal = cadena.at(-1).hash;
  function mostrar(titulo) {
    console.log(`\n${titulo}`);
    for (const bloque of cadena) {
      console.log(`Bloque ${bloque.indice}: ${bloque.dato}`);
      console.log(`  Referencia anterior: ${bloque.anterior}`);
      console.log(`  Hash guardado:      ${bloque.hash}`);
    }
    const errores = verificar(cadena);
    console.log('Cadena internamente consistente:', errores.length === 0);
    errores.forEach(error => console.log('  Motivo:', error));
    console.log('Hash final igual a la referencia original:', cadena.at(-1).hash === referenciaOriginal);
  }
  console.log('UNIDAD 01: DEPENDENCIA ENTRE BLOQUES');
  console.log('Los datos son textos didacticos. No se ejecutan pagos ni reglas de Bitcoin.');
  console.log('Hash de referencia conservado antes de alterar:', referenciaOriginal);
  mostrar('1. CADENA INICIAL');
  cadena[0].dato = 'Ana solicita pagar 90000 satoshis a la libreria';
  mostrar('2. DATO ALTERADO, HASHES SIN RECALCULAR');
  cadena[0].hash = calcularHash(cadena[0]);
  mostrar('3. SOLO SE RECALCULA EL HASH DEL BLOQUE 0');
  recalcular(cadena);
  mostrar('4. TODOS LOS HASHES Y ENLACES RECALCULADOS');
  console.log('\nINTERPRETACION');
  console.log('La consistencia de las cuatro etapas es: true, false, false, true.');
  console.log('En las etapas 2 y 3 el hash final aun coincide, pero la cadena falla al verificarla.');
  console.log('En la etapa 4 la cadena es consistente y el hash final es distinto del original.');
  console.log('Es necesario verificar los enlaces y comparar una referencia confiable.');
  console.log('La simulacion no implementa firmas, consenso, Proof of Work ni Proof of Stake.');
  console.log('Recalcular esta cadena no prueba que una red aceptaria su historia.');
}

// Se puede importar para comprobar casos de alteracion sin ejecutar la demostracion.
import {pathToFileURL} from 'node:url';
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) ejecutarEjemplo();
