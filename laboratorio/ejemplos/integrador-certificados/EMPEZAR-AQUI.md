# Certificados verificables paso a paso

Vamos a seguir un documento desde sus bytes hasta el registro que consulta una aplicación. El contrato y la interfaz están completos. Tu trabajo es predecir, ejecutar, observar y explicar. No necesitás resolver el contador ni escribir JavaScript para realizar esta práctica.

La institución del ejemplo acepta a Ana como autoridad de emisión y revocación. Bruno es otra cuenta y puede consultar. Los dos documentos son ficticios y no contienen datos personales. Uno indica 20 horas y el otro 200. La diferencia permitirá observar qué comprueba una huella.

## 1. Preparar la carpeta de trabajo

Si todavía estás en la carpeta `laboratorio` del repositorio del curso, ejecutá cada línea por separado:

```sh
npm run preparar:certificados
cd practicas/certificados
```

El preparador copia el ejemplo completo a esa carpeta. No altera las plantillas del curso, no instala dependencias ni inicia servicios. Si la carpeta ya existe, la conserva. Para otro ensayo, desde `laboratorio`, podés ejecutar `npm run preparar:certificados -- --nombre certificados-otro` y entrar en `practicas/certificados-otro`.

**Todos los comandos siguientes se ejecutan desde la carpeta de la copia.** Abrí `Certificados.code-workspace` en VS Code. También podés abrir la carpeta directamente. Las tareas numeradas están en Terminal → Ejecutar tarea. Ninguna se inicia automáticamente. Conservá abiertas las terminales que sostienen el nodo y la interfaz.

## 2. Instalar, verificar y compilar

```sh
npm ci
npm run verificar
npm run compilar
```

`npm ci` descarga las versiones fijadas por el archivo de bloqueo. Requiere conexión si no están disponibles en la computadora. `verificar` muestra Node.js, npm y las bibliotecas. `compilar` comprueba el código Solidity y genera ABI y bytecode en `artifacts/contracts/RegistroCertificados.sol/RegistroCertificados.json`.

**Punto de control:** identificá el resumen de compilación en esa terminal y el artifact en el editor. Todavía no existe una instancia del registro en el nodo. Si aparece `No contracts to compile`, puede haber una compilación anterior sin cambios pendientes.

## 3. Probar las reglas en un nodo temporal

```sh
npm test
```

El comando inicia un nodo propio en `127.0.0.1:19646`, despliega un registro, ejecuta las comprobaciones y cierra ese nodo. Comprueba entradas inexistentes, huellas diferentes, permiso de Ana, rechazos de Bruno, duplicados, huella cero, eventos, revocación, conservación del emisor y aislamiento de dos registros.

**Punto de control:** leé el resultado del caso `Certificados`. No significa que ya se haya probado la página, la entrega del documento o tu explicación. Esa instancia temporal tampoco es la que usarás en el navegador.

## 4. Iniciar el nodo de la aplicación

En la terminal A de la copia:

```sh
npm run nodo
```

El proceso atiende consultas y transacciones en `http://127.0.0.1:19645`. Mantené esa terminal abierta. Usa `chainId 31337`, cuentas de desarrollo y saldo ficticio. Es una red independiente del contador de 04/05 en el puerto 8545. El mismo chainId no significa el mismo estado.

**Punto de control:** observá la dirección del servicio en la terminal A. No copies claves a la entrega. Si el puerto está ocupado, identificá qué servicio lo utiliza antes de actuar. No cierres un proceso de otra práctica para liberar el puerto sin comprobarlo.

## 5. Crear la instancia del registro

Abrí una terminal B en la misma carpeta y ejecutá:

```sh
npm run desplegar
```

El script consulta la red, utiliza la primera cuenta local como Ana, envía la creación, espera su recibo y escribe `ui/despliegue.json`. Ese archivo contiene red, acceso, dirección, hash de creación, autoridad, huella del código desplegado y ABI. No contiene claves privadas.

**Punto de control:** abrí el JSON y reconocé esos datos. El registro está vacío. Desplegar no emite el documento. Si repetís el comando creás otra instancia y la página utilizará el nuevo registro al reconectar. La anterior no se actualiza ni se borra por eso.

## 6. Abrir la interfaz y conservar los documentos

En una terminal C, también dentro de la copia:

```sh
npm run interfaz
```

Abrí `http://127.0.0.1:4273`. El servidor entrega la página, sus bibliotecas y los documentos. También dirige las consultas de esta página al nodo local de 19645. Las lecturas y transacciones se ejecutan contra ese nodo y el contrato desplegado.

Descargá ambos archivos con los enlaces de la página. Conservá los bytes originales. No los abras y vuelvas a guardar en un editor que cambie saltos de línea antes de la primera comparación. El nombre del archivo no entra en el cálculo, pero sus bytes sí.

## 7. Consultar antes de emitir

Seleccioná **Ana · autoridad** y pulsá **Conectar**. La página comprueba red, recibo de creación y código de la instancia. Mostrará dirección y cuenta activa.

Seleccioná el archivo original desde tu computadora. El navegador calcula SHA-256 y muestra una huella que empieza con `0x`. Los 64 caracteres siguientes representan 32 bytes. El archivo seleccionado se lee en el navegador y no se sube al servidor. Al consultar, la aplicación envía la huella al nodo.

Pulsá **Consultar registro**. Debe mostrar **Inexistente**. Copiá la huella y la dirección a tu matriz. La consulta no envía una transacción del usuario.

## 8. Comprobar quién puede emitir

Predecí primero qué debería pasar. Seleccioná **Bruno · otra cuenta**, reconectá y pulsá **Emitir certificado** con la huella original.

La solicitud debe rechazarse con `NoAutorizado`. En este recorrido el nodo puede reconocer el rechazo al estimar antes del envío. Eso no es una transacción incluida que consumió gas. Pulsá **Consultar registro** y comprobá que continúa inexistente.

Volvé a Ana, reconectá y emití. La página distingue solicitud, transacción enviada, recibo y consulta posterior. Debe terminar en **Vigente**, con la dirección de Ana como emisor. Registrá el hash y el gas de la emisión.

**Punto de control:** un botón pulsado o un hash obtenido no bastan para afirmar que se emitió. Identificá el recibo exitoso y la consulta posterior que sostienen la conclusión.

## 9. Comparar original y alterado

Seleccioná el archivo alterado y consultá. Tiene otros bytes, otra huella y debe aparecer como inexistente en esta instancia. Volvé a seleccionar el original y consultá: continúa vigente. No emitas el alterado durante este recorrido, para conservar la comparación.

**Explicación que debés construir:** la consulta del alterado no revoca el original. Tampoco prueba por sí sola un fraude. Informa que esa huella no tiene una entrada en esta instancia. Para reconocer al emisor hace falta una autoridad externa aceptada.

## 10. Intentar emitir dos veces

Como Ana, intentá emitir otra vez el original. Debe rechazarse con `YaRegistrado`. Consultá después y comprobá que sigue vigente con el mismo emisor. La aplicación puede detectar el rechazo antes de enviar la transacción.

El contrato comprueba el estado guardado. El permiso de Ana no le permite ignorar la regla de duplicados.

## 11. Interrumpir la entrega del archivo

Conservá la huella original en el campo. Pulsá **Interrumpir acceso al documento**. La comprobación debe mostrar HTTP 503 para la descarga del original. El servidor deja de entregarlo en esta sesión, pero no borra tu copia local ni envía una revocación.

Consultá el registro usando la huella guardada. Si todavía no lo revocaste, sigue vigente. Son dos observaciones distintas: el archivo no se entrega y el contrato conserva su registro. Pulsá **Restaurar acceso** y comprobá HTTP 200. La huella del archivo restaurado debe coincidir con la anterior.

Esta interrupción controlada afecta al archivo original. El contrato y el documento alterado se mantienen disponibles. Reiniciar el servidor de la interfaz restablece la entrega del archivo, sin reiniciar el nodo.

## 12. Revocar y comprobar la permanencia del estado

Seleccioná a Bruno, reconectá e intentá revocar el original. Debe obtener `NoAutorizado`. Consultá y comprobá que continúa vigente.

Como Ana, reconectá y revocá. Esperá el recibo y consultá: el estado es **Revocado** y el emisor se conserva. Intentar emitir esa misma huella debe obtener `YaRegistrado`. Intentar revocarla otra vez debe obtener `NoVigente`.

Descargá nuevamente el original. Puede seguir disponible aunque el registro esté revocado. Revocar no elimina el archivo. Este modelo no tiene una operación de reactivación.

## 13. Medir con una instancia independiente

En la terminal B, sin detener el nodo o la interfaz:

```sh
npm run recorrido
```

El script crea otra instancia, ejecuta el recorrido y guarda `resultados/recorrido-certificados.json`. Muestra los estados 0 → 0 → 1 → 1 → 2 para el original. Conserva las huellas, la dirección y los recibos de emisión y revocación. Los rechazos se comprueban mediante llamadas de simulación antes del envío.

**Punto de control:** compará la dirección del informe con `ui/despliegue.json`. Son instancias distintas. El script no reemplaza la configuración de la página ni comprueba la interrupción del archivo. El número de direcciones diferentes también depende de cuántas veces ejecutaste cada comando.

Para presupuestar, tomá `gasUsed` de emisión y de revocación por separado. Elegí cantidades mensuales, precio por gas y conversión hipotética a USD. Identificá esos valores como supuestos. Sumá alojamiento, RPC y mantenimiento. No uses la comisión local como si fuera una cotización de mainnet.

## 14. Interpretar una falla de conexión

Conservá las evidencias anteriores. Detené solo tu nodo de la terminal A con Ctrl+C. La página puede seguir visible porque su servidor continúa activo. Intentá consultar: debe informar que no obtuvo una lectura nueva, sin presentar un estado anterior como recién comprobado.

Si vuelve a iniciarse un nodo vacío, el deployment guardado puede quedar sin código. Volvé a desplegar, reconectá y consultá. La instancia nueva comienza sin certificados, aunque una dirección se repita. La red local no recupera su estado anterior por conservar el JSON.

Si el corte ocurre después de enviar una operación, no deduzcas que no se ejecutó. Conservá el hash y comprobá su resultado antes de reenviar. Si la aplicación ya recibió un recibo exitoso y luego falló una lectura, debe distinguir ambos hechos.

## 15. Entregar y defender la evidencia

La consigna y la matriz están en `laboratorios/integracion-certificados` del repositorio del curso. Reuní predicciones, observaciones, dirección, hashes públicos, un esquema de componentes, mediciones y justificación. Se reutilizan las evidencias de las unidades relacionadas, sin repetir capturas idénticas en varios informes.

Los tests no evalúan automáticamente la matriz, el presupuesto ni la defensa. El código provisto tampoco permite acreditar que desarrollaste una aplicación desde cero. La tarea consiste en comprenderla, comprobarla y argumentar sus decisiones.

## Si necesitás localizar una pieza

| Archivo | Función |
|---|---|
| `contracts/RegistroCertificados.sol` | Estado persistente, permisos y transiciones. |
| `documentos/` | Bytes ficticios que se comparan. |
| `ui/app.js` | Hash local, conexión, consultas y escrituras de la página. |
| `scripts/desplegar.mjs` | Creación de la instancia que usará la página. |
| `scripts/recorrido.mjs` | Otra instancia para observar reglas y medir operaciones. |
| `tests/registro.test.mjs` | Comprobaciones del contrato en el nodo temporal. |
| `scripts/interfaz.mjs` | Entrega de página y archivos e interrupción controlada del documento. |

Las explicaciones se desarrollan en las unidades 03 y 05 y en el material de integración. Las unidades 06, 07, 09 y 10 permiten interpretar las mediciones, la identidad de la instancia, los rechazos y los costos.
