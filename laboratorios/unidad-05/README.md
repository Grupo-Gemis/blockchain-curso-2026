# Unidad 05 · Interfaz conectada y pruebas funcionales

Se continúa con el contador de las unidades 03 y 04. Ana crea la instancia y Bruno puede incrementarla, pero no reiniciarla. La interfaz distingue consultas, solicitudes, envíos pendientes y resultados comprobados. La práctica obligatoria utiliza cuentas locales, sin wallet externa ni fondos reales.

## Preparación

Contador implementado y deployment local verificado. Completar `ui/cliente.js` antes de probar escrituras. El archivo conserva su TODO para resolver durante esta práctica.

Los comandos se ejecutan desde la carpeta `laboratorio` del repositorio.

```sh
npm run compilar
npm test -- Contador
npm test -- Interfaz
```

## Trabajo autónomo

1. Completá `enviarYConfirmar` en `laboratorio/ui/cliente.js`. Debe informar solicitud de firma y envío, Pendiente con hash y Confirmada después de un recibo con status 1. Debe devolver ese recibo y propagar errores. Un recibo inexistente o fallido no permite anunciar éxito.
2. Ejecutá `npm test -- Interfaz`. La salida se ve en la terminal. Los tests retienen una promesa pendiente para comprobar que no se anticipa éxito, verifican el recibo devuelto y ensayan errores. Sus transacciones son respuestas simuladas.
3. En la terminal 1 ejecutá `npm run nodo`. En la terminal 2 ejecutá `npm run desplegar`, `npm run verificar:deployment` y `npm run interfaz`. Ambas terminales quedan abiertas. Abrí `http://127.0.0.1:4173`. El servidor de la página usa 4173 y el nodo RPC usa 8545.
4. Seleccioná A y pulsá **Conectar cuenta local**. Verificá red, contrato, cuenta y valor. Pasá a B y reconectá. Incrementá dos veces, esperando cada operación. Comprobá 1 y luego 2.
5. Con B intentá reiniciar. Registrá el rechazo y valor 2 conservado. Volvé a A, reconectá y comprobá reinicio a cero. Un rechazo al estimar gas puede ocurrir antes de obtener un hash.
6. Observá que los botones y el selector local se deshabilitan durante una escritura. El nodo local confirma rápido. Para estudiar un período pendiente prolongado usá también la simulación del apunte.
7. Apagá únicamente tu nodo y pulsá Actualizar. La interfaz debe informar un problema de conexión, limpiar el contexto y pedir reconexión. Una caída después del envío no demuestra que la transacción no se ejecutó. No reenviarla sin comprobar su resultado.
8. Reiniciá el nodo sin redesplegar e intentá conectar con el registro anterior. Documentá la ausencia de código. Redesplegá, verificá, recargá la interfaz y reconectá.

## Matriz mínima de integración

| Caso | Precondición | Acción | Resultado esperado |
|---|---|---|---|
| Lectura | Registro e instancia vigentes | Conectar A y actualizar | Cuenta, red, dirección y valor coherentes. |
| Incrementos | B conectada, valor 0 | Incrementar dos veces | Dos recibos exitosos y valor 2. |
| Permiso rechazado | B conectada, valor 2 | Reiniciar | Rechazo y valor 2 conservado. |
| Reinicio autorizado | A conectada, valor 2 | Reiniciar | Recibo exitoso y valor 0. |
| Cambio local | Conexión activa | Seleccionar otra cuenta | Operaciones deshabilitadas hasta reconectar. |
| Desconexión | Nodo apagado | Actualizar | Mensaje de RPC y reconexión necesaria. |
| Sesión nueva | Nodo reiniciado sin deployment | Conectar | Rechazo del registro por ausencia de código. |

## Qué se comprueba automáticamente

`npm test -- Interfaz` prueba el helper con respuestas simuladas: orden de estados, espera efectiva, recibo devuelto, status fallido, recibo ausente, firma rechazada y error de espera. No abre la página ni una wallet. No asigna nota ni envía resultados a Moodle.

La matriz de la DApp, mensajes, cuenta/red, botones, desconexión y recuperación se revisan con la integración real en el navegador y la evidencia docente. El workflow general de GitHub no ejecuta todos los TODO. Revisá los casos configurados antes de interpretar un estado verde.

## Extensión opcional con wallet

Con una wallet disponible en el navegador, configurá una red local de desarrollo con RPC `http://127.0.0.1:8545` y chainId 31337. Usá exclusivamente una cuenta de prueba del nodo para este entorno. No utilizar cuentas de desarrollo en redes públicas ni incluir claves en la entrega. La cuenta debe estar autorizada para el sitio y tener fondos locales de prueba.

Pulsá **Conectar wallet**. Opera la cuenta que autoriza la wallet, no el selector A/B del modo local. Agregá casos de firma cancelada y eventos de cambio de cuenta o red. Estos cambios invalidan la conexión y los resultados tardíos del contexto anterior no deben habilitar nuevas operaciones. La práctica obligatoria no depende de esta extensión.

## Evidencia

Matriz con los siete casos mínimos, precondición, actor, acción, resultado esperado y observado. Incluir una escritura confirmada, un rechazo esperado, desconexión y recuperación. Adjuntá el resultado del helper y explicá por qué esa prueba no demuestra toda la integración.

## Criterios de comprobación

- La UI obtiene el estado del contrato.
- El éxito se presenta después de comprobar el recibo.
- Una cuenta no autorizada no puede reiniciar.

## Extensión

Agregar un control incrementarEn y mantener la misma gestión de estados y errores.

## Material relacionado

- [Apunte de la unidad](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-05.html)
- [Actividad de aplicación](../../actividades/unidad-05.md)
- [Preparación del laboratorio](../../laboratorio/README.md)
