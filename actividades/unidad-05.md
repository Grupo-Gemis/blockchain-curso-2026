# Unidad 05 · Una interfaz que dice éxito demasiado pronto

Ana y Bruno utilizan la instancia verificada en la unidad 04. La interfaz muestra Operación exitosa apenas obtiene un hash. Después la transacción revierte por permisos. El equipo debe corregir el flujo y proponer pruebas.

1. Explicar proveedor, firmante y configuración necesaria. Distinguir la cuenta del selector local de la cuenta autorizada por una wallet.
2. Corregir el momento en el que se muestra éxito. Indicar qué se observa durante la espera y qué ocurre si falta el recibo, tiene status 0 o falla la comunicación. Mostrar el valor leído después de confirmar.
3. Diseñar pruebas para la cuenta no autorizada, el cambio de cuenta, la desconexión y la recuperación después de reiniciar el nodo. Explicar por qué no se debe reenviar automáticamente cuando se desconoce el resultado de una operación ya enviada.

Completar la matriz de siete casos del [laboratorio 05](../laboratorios/unidad-05/README.md) y separar lo que comprueban los tests del helper de lo que se observa en el navegador. Si se utiliza la extensión con wallet, agregar cancelación de firma y cambio de red.
