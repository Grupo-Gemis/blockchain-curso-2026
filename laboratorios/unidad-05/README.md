# Unidad 05 · Guía para usar la página y entender una operación completa

Esta práctica utiliza **el contador y la interfaz completos**. No tenés que implementar `enviarYConfirmar` ni editar JavaScript. Vas a seguir una operación desde un botón hasta su resultado en el contrato, observar errores y comparar clientes que comparten el mismo estado.

Ana es la cuenta 0 y Bruno la 1. El permiso sigue en el contrato: cambiar de página o de cliente no autoriza a Bruno a reiniciar.

## Antes de empezar: misma carpeta, código listo

Si seguiste 04, continuá en `laboratorio/practicas/unidades-04-05`. Si empezás directamente aquí, desde la raíz del repositorio:

```sh
cd laboratorio
npm run preparar:guiado
cd practicas/unidades-04-05
npm ci
npm run verificar
npm run compilar
npm test
```

El preparador deja el contrato y el helper resueltos sin modificar ejercicios anteriores. La copia guiada ejecuta ocho casos con `npm test`. No necesitás haber programado el contador en 03. A partir de ahora todas las rutas y comandos se interpretan desde **esa carpeta de práctica**.

Necesitás dos terminales y el navegador. La terminal 1 mantiene el nodo. La 2 prepara la instancia y luego mantiene el servidor web. La terminal 3 se abre más adelante para otros comandos mientras los dos servicios siguen activos.

| Pieza | Dónde está | Para qué sirve |
|---|---|---|
| Contador | Nodo RPC en 8545 | Guarda valor y propietario, ejecuta incrementos y permisos. |
| Página | Servidor web en 4173 | Entrega HTML y JavaScript al navegador. |
| `ui/app.js` | Archivo ejecutado por el navegador | Conecta botones, cuenta, configuración y contrato. |
| `ui/cliente.js` | Función completa de confirmación | Espera envío y recibo e informa las etapas. |
| `ui/despliegue.json` | Registro de la instancia | Identifica red, dirección y ABI que utiliza la página. |

## 1. Mirar qué hace la confirmación, sin programarla

**Qué hacés.** Abrí `ui/cliente.js` en la copia preparada y leé sus comentarios. Localizá las dos expresiones con `await` y el control de `status`. No edites el archivo. En la terminal 2 podés ejecutar:

```sh
npm test -- Interfaz
```

**Qué ocurre por detrás.** La función recibe `operacion`, que solicita la escritura, y `estado`, que comunica mensajes a la página. Espera primero que la solicitud devuelva una transacción. Luego espera que esa transacción tenga un recibo. `await` indica que no debe continuar esa secuencia hasta obtener el resultado.

| Etapa | Información disponible | Mensaje correcto |
|---|---|---|
| Solicitud | Todavía no hay un envío comprobado. | Esperando firma y envío. |
| Envío | Hay una transacción con hash. | Pendiente con ese hash. |
| Ejecución | Llega un recibo exitoso, `status: 1`. | Confirmada con el hash. |
| Lectura posterior | La página vuelve a consultar el contrato. | Muestra el valor actual. |

**Qué vas a ver.** Los seis casos Interfaz deben pasar. Utilizan respuestas simuladas para retener un recibo y provocar errores controlados. No abren el navegador ni una wallet. La función devuelve el recibo exitoso. Si falta, falla o se rechaza la solicitud, propaga el error sin comunicar confirmación.

**Antes de seguir.** Un hash no demuestra ejecución exitosa. `tx.wait()` puede lanzar un error si la transacción revierte. El control del recibo evita anunciar éxito sin evidencia válida. “Confirmada” en este ejemplo acredita el bloque observado, no una medición de finalidad de una red pública.

## 2. Preparar los dos servicios y una instancia nueva

**Qué hacés.** En la terminal 1, desde la carpeta preparada:

```sh
npm run nodo
```

Si tu propio nodo de 04 sigue activo, utilizalo. En la terminal 2, desde la misma carpeta:

```sh
npm run desplegar
npm run verificar:deployment
npm run interfaz
```

Abrí **http://127.0.0.1:4173** en el navegador. No abras el HTML haciendo doble clic en un archivo.

**Qué ocurre por detrás.** El nodo de 8545 ejecuta Solidity. El despliegue prepara otra instancia del contador en 0, propiedad de Ana, y actualiza el registro. El servidor de 4173 entrega los archivos de la página, ethers y la configuración. Son procesos diferentes.

**Qué vas a ver.** La terminal 1 queda ocupada por el nodo. La 2 muestra la URL del servidor y también queda ocupada. En el navegador aparece “Un contador compartido”, selector A/B, dos botones de conexión y operaciones deshabilitadas hasta conectar.

**Antes de seguir.** Que cargue la página solo demuestra que responde el servidor web. Todavía hay que comprobar la conexión con el nodo y la instancia. Si necesitás ejecutar otro comando, abrí una terminal 3 en la carpeta preparada.

## 3. Conectar a Ana y leer cero

**Qué hacés.** Seleccioná **A · propietaria del despliegue**, pulsá **Conectar cuenta local** y esperá `Conexión lista.`. Después pulsá **Actualizar**.

**Qué ocurre por detrás.** La página lee el registro. Un proveedor, o *provider*, se comunica con el RPC. Comprueba red 31337 y código en la dirección indicada. Obtiene el firmante, o *signer*, de Ana y prepara un objeto cliente con dirección y ABI. Crear ese objeto no despliega otro contrato. Consulta `valor()`.

**Qué vas a ver.** Red **31337**, dirección del contrato, dirección de la cuenta de Ana y valor **0**. La dirección del contrato debe coincidir con el registro. Actualizar debe conservar 0.

**Antes de seguir.** El número grande es la última lectura del contrato. No es un saldo de ETH. Actualizar no incrementa el contador y no necesita una transacción de escritura. El modo local utiliza cuentas del nodo y no abre una ventana de wallet para cada operación.

## 4. Cambiar a Bruno e incrementar dos veces

**Qué hacés.** Seleccioná **B · participante**. Observá antes de reconectar. Luego pulsá **Conectar cuenta local**. Pulsá **Incrementar**, esperá confirmación y lectura en 1. Repetí para llegar a 2.

**Qué ocurre por detrás.** Cambiar el selector invalida el contexto anterior: elegir B no equivale a haber establecido una conexión nueva. Al reconectar, el cliente usa a Bruno como firmante. Cada clic solicita la función `incrementar()`. El helper informa las etapas y espera el recibo. Después `app.js` consulta el valor y actualiza la pantalla.

**Qué vas a ver.** Antes de reconectar, operaciones deshabilitadas y pedido de reconexión. Después, cuenta B con la misma red y contrato. Tras cada incremento, confirmación con hash y lecturas **1**, luego **2**. Durante una escritura se bloquean botones y selector.

**Antes de seguir.** El nodo local confirma rápido y algunos mensajes intermedios pueden durar poco. Los tests con respuesta retenida permiten comprobar la espera. No repitas clics para tratar de ver el estado pendiente: cada clic aceptado solicita otra escritura.

## 5. Comparar el permiso de Bruno con el de Ana

**Qué hacés.** Con B conectada y valor **2**, pulsá **Reiniciar**. Leé el mensaje y después pulsá **Actualizar**. Cambiá a A, reconectá y pulsá **Reiniciar** otra vez.

**Qué ocurre por detrás.** En el primer intento, el contrato compara al llamador con el propietario y rechaza a Bruno. En el segundo, Ana cumple la condición, pone el valor en 0 y emite el evento. La regla funciona aunque ambos vean el mismo botón.

**Qué vas a ver.** Bruno recibe **NoAutorizado** y el valor sigue en **2**, incluso después de actualizar. Ana recibe confirmación y la nueva lectura muestra **0**. El intento de Bruno puede rechazarse antes del envío, durante la estimación de gas, y no tener hash ni recibo.

**Antes de seguir.** Un error de conexión no prueba permiso correcto. Compará actor, mensaje y valor conservado. El botón no es la barrera de autorización: la comprobación está dentro del contrato.

## 6. Apagar solo el nodo y consultar desde la página

**Qué hacés.** Mantené el servidor web abierto en la terminal 2. Detené **tu nodo** con `Ctrl+C` en la terminal 1. En la página pulsá **Actualizar** y esperá el resultado.

**Qué ocurre por detrás.** La página sigue cargada y su servidor puede seguir activo, pero el proveedor ya no puede alcanzar el RPC. El cliente invalida la conexión para no presentar una lectura vieja como si acabara de verificarla.

**Qué vas a ver.** Mensaje de problema con RPC, reconexión necesaria, valor mostrado como **—** y operaciones deshabilitadas. El signo no significa cero. Indica que no hay una lectura vigente para ese contexto.

**Antes de seguir.** Este ensayo provoca una falla antes de consultar. Si se corta la comunicación después de enviar una escritura, el cliente puede desconocer su resultado. Conservá el hash y comprobá antes de reenviar. Un mensaje de conexión fallida no demuestra que la transacción no se ejecutó.

## 7. Recuperar la aplicación sin confundir archivo y contrato

**Qué hacés.** Iniciá otra vez tu nodo en la terminal 1 con `npm run nodo`. **Antes de redesplegar**, intentá conectar desde la página. Registrá el resultado.

Ahora abrí una terminal 3 en la carpeta preparada:

```sh
npm run desplegar
npm run verificar:deployment
```

Recargá la página y volvé a conectar a A.

**Qué ocurre por detrás.** El registro de dirección sobrevivió en disco. El estado de la sesión local anterior no. La página detecta primero ausencia de código. El nuevo despliegue crea una instancia y actualiza el registro. Recargar y reconectar hacen que el navegador vuelva a usar esa configuración.

**Qué vas a ver.** Antes de crear: aviso de que no existe el contrato en esta sesión. Después de crear, verificar, recargar y conectar: cuenta A, red/dirección coherentes y valor **0**.

**Antes de seguir.** Recargar la página no crea contratos ni restaura el contador anterior. La recuperación necesitó acciones en el nodo y en el cliente.

## 8. Comprobar dos pestañas y un único estado

**Qué hacés.** Con la instancia nueva en 0, abrí otra pestaña de http://127.0.0.1:4173. Conectá ambas y compará red, dirección y valor 0. En la primera incrementá una vez. Mirá la segunda antes de pulsar **Actualizar**. Después actualizala.

**Qué ocurre por detrás.** Cada pestaña conserva su última lectura en memoria, pero ambas consultan el mismo contrato. Esta interfaz no tiene una suscripción que refresque automáticamente todas las pantallas. Actualizar realiza otra consulta.

**Qué vas a ver.** La primera llega a **1**. La segunda puede seguir en **0** hasta actualizar y después debe llegar a **1**. Recargar una pestaña no incrementa ni borra el contrato.

**Antes de seguir.** Si después de consultar difieren, compará red y dirección. Dos pantallas iguales no garantizan que estén usando la misma instancia. La identidad se verifica con esos datos.

## 9. Usar otro cliente y observarlo desde ambas páginas

**Qué hacés.** En la terminal 3, con la instancia en 1:

```sh
npm run usar:contador -- incrementar --cuenta 1
```

Actualizá ambas pestañas. Después, en esa terminal:

```sh
npm run usar:contador -- reiniciar --cuenta 1
```

Volvé a actualizar las páginas.

**Qué ocurre por detrás.** Un programa distinto del navegador utiliza el mismo registro y solicita acciones desde Bruno. El contrato conserva sus reglas independientemente del cliente. Las páginas se enteran del cambio cuando vuelven a consultar.

**Qué vas a ver.** El incremento de terminal muestra **1 → 2** y recibo exitoso. Ambas páginas actualizadas muestran **2**. El reinicio desde terminal da **NoAutorizado** y las páginas siguen leyendo **2**.

**Antes de seguir.** Esto permite descartar que la página se limite a sumar un número en su HTML. El estado también cambia desde otro cliente y el permiso sigue funcionando fuera de los botones.

## Qué entregar: observar y explicar

No se evalúa escribir el contrato ni la función de confirmación. Completá esta matriz con **tu resultado observado y su evidencia**. Los resultados esperados de esta tabla no reemplazan una ejecución propia.

| Caso | Precondición y acción | Resultado esperado |
|---|---|---|
| Lectura | Instancia nueva, conectar A y actualizar. | Datos del registro coherentes y 0. |
| Cambio local | A conectada, seleccionar B y luego reconectar. | Primero operaciones deshabilitadas, después cuenta B. |
| Incrementos | B en 0, incrementar dos veces esperando. | Confirmaciones y lecturas 1 y 2. |
| Permiso rechazado | B en 2, reiniciar y consultar. | NoAutorizado, 2 conservado. |
| Reinicio autorizado | A reconectada, reiniciar desde 2. | Confirmación y 0. |
| Nodo detenido | Servidor activo, detener nodo y actualizar. | Error RPC y contexto invalidado. |
| Recuperación | Nodo nuevo sin crear. Luego desplegar, verificar y reconectar. | Primero sin contrato. Después 0 en instancia nueva. |
| Dos pestañas | Ambas en 0, escribir en una y consultar la otra. | Lectura vieja hasta Actualizar. Después ambas en 1. |
| Otro cliente | Incrementar en terminal y actualizar páginas. Intentar reinicio de B. | Todas en 2 y permiso conservado. |

Guardá el informe fuera de la carpeta de ejecución, por ejemplo junto al laboratorio en tu repositorio. Las copias de práctica y archivos generados no se incluyen automáticamente en Git.

Explicá además qué sucede entre clic, hash, recibo y lectura, por qué Actualizar no escribe y qué puede desconocerse tras un corte de comunicación. Los tests de Interfaz usan respuestas simuladas. La matriz utiliza el nodo y contrato reales del entorno local. Ninguna de esas pruebas asigna una nota automática en Moodle.

## Si algo no coincide

| Síntoma | Qué revisar |
|---|---|
| Falta el helper o aparecen funciones pendientes. | Estás usando la carpeta original en lugar de la copia guiada. |
| No carga 4173. | El servidor de la terminal 2. |
| La página carga pero falla el RPC. | El nodo de la terminal 1 y el puerto 8545. |
| No hay código después del reinicio. | Es la observación esperada antes de crear otra instancia. |
| La otra pestaña muestra un número viejo. | Actualizar y comparar red y dirección. |
| Hay recibo exitoso pero no pudo actualizar la lectura. | La escritura ya se confirmó. Reconectar y consultar antes de volver a enviar. |

Cerrar la pestaña no detiene los servicios. Detener el servidor web no borra el contrato. Al terminar, detené tus procesos con `Ctrl+C` en sus terminales.

## Extensión opcional con wallet

La práctica obligatoria usa **Conectar cuenta local**. Si disponés de una wallet, podés ensayar **Conectar wallet** con RPC http://127.0.0.1:8545, chainId 31337 y una cuenta exclusiva de prueba del nodo. Opera la cuenta autorizada por la wallet, independientemente del selector A/B. No utilices claves de desarrollo en redes públicas ni incluyas claves en las evidencias.

Agregá cancelación de firma, cambio de cuenta y cambio de red. Identificá esta evidencia por separado. El modo local no reproduce la ventana de una extensión de wallet.

## Material relacionado

- [Apunte de la unidad](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-05.html)
- [Actividad de observación](../../actividades/unidad-05.md)
- [Función completa de confirmación](../../laboratorio/ejemplos/guiado-04-05/cliente.js)
- [Guía anterior: preparación y nodo](../unidad-04/README.md)


## Continuación con documentos verificables

El [caso integrador](../integracion-certificados/README.md) agrega un archivo externo, su huella SHA-256 y un registro de vigencia. La copia se prepara aparte con código completo. Se reutilizan las evidencias de conexión, recibo, consulta y errores, agregando original, alterado y disponibilidad. No modifica el contador de esta práctica.
