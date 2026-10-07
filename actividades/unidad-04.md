# Unidad 04 · El contrato que desapareció

Ana y Bruno continúan con el contador de la unidad 03. Ana despliega desde la cuenta local 0 y Bruno incrementa dos veces desde la cuenta 1. El equipo reinicia su nodo y conserva en el frontend una dirección de la sesión anterior. La consulta deja de funcionar. Debe diagnosticar el problema sin reinstalar las herramientas.

1. Reconstruir el orden de instalación, compilación, inicio de nodo y despliegue. Indicar dónde se ve el resultado de cada paso y cuál crea una instancia.
2. Verificar la red y la existencia de código en la dirección **antes de redesplegar**. Comparar el RPC de la interfaz en 8545 con el nodo temporal de tests en 18545. Explicar por qué una prueba exitosa no recupera el contrato anterior.
3. Diseñar dos pruebas positivas y una negativa para Contador. Redesplegar, consultar y comparar dirección, recibo y valor. Explicar qué significa que la dirección se repita, pero el contador vuelva a cero.

Registrar precondición, actor, acción, resultado esperado y observado. La secuencia detallada y los criterios están en el [laboratorio 04](../laboratorios/unidad-04/README.md).
