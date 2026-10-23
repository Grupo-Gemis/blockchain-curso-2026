# Unidad 06 · Un presupuesto con dos errores

Un equipo calcula 80.000 × (20 + 2) y presenta ese importe como comisión real, aunque el recibo informa 50.000 gas. También etiqueta gwei como ETH. Deben corregir la planilla.

Datos del caso: gas used 50.000, gas limit 80.000, base fee 20 gwei/gas, priority fee máxima 2 gwei/gas y max fee 30 gwei/gas.

1. Calcular precio efectivo y comisión del recibo.
2. Calcular la reserva máxima y distinguirla de la comisión.
3. Justificar cómo se usa una medición en un presupuesto.


## Aplicación al contador compartido

En la demostración conjunta de las unidades 06 y 07, completá una tabla con creación, incrementos y reinicios. Usá los datos observados de gas, precio y comisión, red, hash y bloque. Distinguí rechazo previo, ejecución revertida incluida y ejecución exitosa. Relacioná las confirmaciones con el bloque y la finalización con el dato observado de finalized. Explicá por qué reiniciar a cero conserva los eventos anteriores.

Seguí la guía del laboratorio. Si solo se realizó el ensayo local, indicalo y conservá la parte pública como pendiente. No es necesario comprar saldo ni contratar un RPC.
