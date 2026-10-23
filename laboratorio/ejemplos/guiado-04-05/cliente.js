// Ejemplo completo para observar y ejecutar en la unidad 05.
export async function enviarYConfirmar(operacion, estado) {
  // Todavía no sabemos si la solicitud se aceptará o se enviará.
  estado('Esperando firma y envío…');
  const tx = await operacion();

  // Tener un hash permite identificar el envío. Falta comprobar la ejecución.
  estado(`Pendiente de confirmación: ${tx.hash}`);
  const recibo = await tx.wait();

  // Solo un recibo existente y exitoso permite comunicar confirmación.
  if (!recibo || recibo.status !== 1) {
    throw new Error('La transacción no se confirmó correctamente.');
  }
  estado(`Confirmada: ${recibo.hash}`);
  // app.js utilizará el resultado y consultará después el valor actual.
  return recibo;
}
