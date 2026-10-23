# Unidad 04 · Guía para ejecutar el contador y entender dónde vive

Esta práctica se hace con **código completo, listo para probar**. No tenés que programar ni haber resuelto el contrato de la unidad 03. Vas a ejecutar las reglas del contador, mirar sus resultados y explicar qué ocurre en cada etapa.

Ana puede incrementar y reiniciar. Bruno puede incrementar, pero no reiniciar. Vamos a observar el valor 0 → 1 → 2 y después comparar qué pasa al detener el nodo y crear otra instancia.

## Cómo seguir la guía

En cada paso aparecen cuatro partes: **qué hacés**, **qué ocurre por detrás**, **qué vas a ver** y **antes de seguir**. Ejecutá una línea, esperá que termine y leé el resultado antes de pasar a la siguiente. Las salidas de ejemplo indican qué buscar, no datos para copiar como si fueran tuyos.

Necesitás Node.js 24, una copia de tu repositorio del curso, una terminal y un editor. La primera instalación necesita Internet. No necesitás fondos reales ni una wallet externa.

Vas a usar dos terminales: la **terminal 1** mantiene el nodo y la **terminal 2** envía las órdenes. Una terminal que mantiene un servicio queda ocupada. No es una falla ni hay que cerrarla para poder trabajar: usás la otra.

## 0. Preparar la carpeta con todo resuelto

**Qué hacés.** Abrí tu repositorio en el editor. En una terminal ubicada en su raíz:

```sh
cd laboratorio
npm run preparar:guiado
cd practicas/unidades-04-05
```

Si ya estabas en `laboratorio`, omití la primera línea. El comando de preparación funciona antes de instalar dependencias. Anotá la carpeta completa que informa.

**Qué ocurre por detrás.** El preparador crea una copia local con el contrato Contador, la función de confirmación y la interfaz completos. Reutiliza las herramientas y pruebas del curso. No cambia tu ejercicio anterior, no despliega nada y no inicia una red. Las otras unidades no son requisitos de esta copia.

**Qué vas a ver.** Un mensaje de práctica preparada y una ruta que termina en `laboratorio/practicas/unidades-04-05`. Abrí esa carpeta en el editor. **Desde ahora todos los comandos de esta guía y de 05 se ejecutan dentro de ella.**

**Antes de seguir.** Comprobá que allí estén `package.json`, `contracts/Contador.sol`, `ui/cliente.js` y `ui/app.js`. El contrato y el helper ya están escritos. No copies encima las plantillas pendientes de la carpeta original.

Si repetís la preparación, conserva la carpeta existente sin sobrescribirla. Para un ensayo nuevo separado, desde la carpeta `laboratorio` original podés usar `npm run preparar:guiado -- --nombre demostracion-2`. En ese caso trabajás dentro de `practicas/demostracion-2`.

## 1. Reconocer el programa que vas a ejecutar

**Qué hacés.** Abrí `contracts/Contador.sol` en la carpeta preparada. Leé los comentarios. Buscá `valor`, `propietario`, `constructor`, `incrementar` y `reiniciar`. No edites el archivo.

**Qué ocurre por detrás.** `valor` es un número guardado en el contrato. Empieza en cero. Al crearlo, el constructor guarda la dirección de quien lo crea como propietario. `incrementar()` suma uno y emite el evento `ValorCambiado`. `reiniciar()` primero compara al llamador, `msg.sender`, con el propietario. Si son distintos, rechaza con `NoAutorizado`.

**Qué vas a ver.** Las dos funciones tienen instrucciones completas. El contador no representa ETH: representa la cantidad de incrementos desde el último reinicio autorizado. Un evento deja información de la operación, como autor y nuevo valor, que los clientes pueden interpretar.

**Antes de seguir.** Predecí: si Ana crea el contrato y Bruno incrementa dos veces, ¿cuánto queda? Si Bruno trata de reiniciar, ¿qué debería pasar? Anotá **2, rechazo y 2 conservado** como expectativa que vas a contrastar.

## 2. Instalar y reconocer las herramientas

**Qué hacés.** En la terminal 2, dentro de la carpeta preparada:

```sh
npm ci
npm run verificar
```

**Qué ocurre por detrás.** `npm ci` instala las dependencias según `package-lock.json`. Hardhat prepara compilación y red de desarrollo. ethers permite que los scripts se comuniquen con el nodo. `npm run verificar` consulta versiones. Instalar herramientas todavía no crea el contrato.

**Qué vas a ver.** Durante la instalación aparecen mensajes de paquetes. Al terminar vuelve el indicador para escribir, llamado *prompt*. La verificación muestra versiones de Node.js, npm, Hardhat, ethers y OpenZeppelin. Guardá esa salida.

**Antes de seguir.** No debe aparecer falta de dependencias. Si no encuentra `package.json`, revisá que estás en la carpeta preparada. Una instalación pendiente requiere esperar, no volver a lanzar la misma orden en paralelo.

## 3. Compilar y ejecutar las pruebas ya preparadas

**Qué hacés.** En la terminal 2:

```sh
npm run compilar
npm test
```

**Qué ocurre por detrás.** El compilador transforma el texto de Solidity en instrucciones ejecutables y una descripción de la interfaz. El artifact es el archivo que contiene esos resultados. La ABI describe funciones, eventos y errores. El bytecode de creación se utiliza para crear una instancia del programa.

El test de esta copia guiada ejecuta **ocho casos** de Contador, Interfaz y Deployment. Prepara su propio nodo temporal en **18545**, lo utiliza y lo cierra. No necesita que abras el nodo de la práctica. No te pide completar funciones.

**Qué vas a ver.** El resumen de compilación y luego los resultados de las pruebas en esa terminal. Deben pasar los ocho casos. Abrí `artifacts/contracts/Contador.sol/Contador.json` y localizá `abi` y `bytecode`, sin copiar el bytecode completo al informe. Si dice `No contracts to compile`, puede estar reutilizando la compilación válida anterior.

**Antes de seguir.** Deben pasar las pruebas. Todavía no existe tu contador manual: los tests crearon sus propias instancias en otra red de ensayo. Compilar tampoco inicia un nodo ni despliega por sí solo.

## 4. Iniciar el nodo y dejarlo funcionando

**Qué hacés.** Abrí la terminal 1 **en la misma carpeta preparada**. Si parte de la raíz del repositorio, llegás con `cd laboratorio/practicas/unidades-04-05`. Ejecutá:

```sh
npm run nodo
```

**Qué ocurre por detrás.** Arranca el proceso que simula la red blockchain en tu computadora. Ofrece cuentas de prueba, ejecuta las operaciones y mantiene el estado de esta sesión. RPC significa llamada a procedimiento remoto: es la forma en que un cliente le pide datos o le envía operaciones.

**Qué vas a ver.** Un servicio en `http://127.0.0.1:8545`. `127.0.0.1` identifica tu computadora. **8545 es el puerto**. El identificador de red, **chainId, es 31337**. Son datos diferentes. También aparecen cuentas de desarrollo. La cuenta 0 será A, Ana. La 1 será B, Bruno.

**Antes de seguir.** Dejá esta terminal abierta. En el siguiente paso usás la terminal 2. Si el puerto está ocupado, comprobá si ya tenés tu propio nodo activo. No detengas un proceso ajeno ni abras dos nodos en el mismo puerto. No incluyas las claves del nodo en la entrega.

## 5. Crear una instancia del contador

**Qué hacés.** En la terminal 2, dentro de la carpeta preparada:

```sh
npm run desplegar
```

**Qué ocurre por detrás.** El script toma el bytecode compilado y envía una transacción de creación desde la cuenta 0. El nodo la ejecuta. El constructor guarda a Ana como propietaria y el contador empieza en 0. A ese contrato creado, con dirección y estado propios, lo llamamos **instancia**.

**Qué vas a ver.** La terminal muestra red local 31337, `Contador:` seguido de una dirección y `Creación:` seguido de un hash. Guarda esos datos y la ABI en `ui/despliegue.json`. El hash identifica la transacción. La dirección identifica el contrato en la red consultada.

**Antes de seguir.** Abrí el registro. Buscá `chainId`, `contador`, `contadorTransactionHash` y `abi`. Anotá red, dirección y hash de tu ejecución. No vuelvas a desplegar para hacer una lectura: otra ejecución crea otra instancia y actualiza el registro.

## 6. Leer y verificar lo que creaste

**Qué hacés.** En la terminal 2:

```sh
npm run consultar
npm run verificar:deployment
```

**Qué ocurre por detrás.** La consulta carga el registro, comprueba red y presencia de código y lee propietario y valor. No cambia ese valor. El verificador revisa también la transacción y el recibo de creación. Un recibo, o *receipt*, registra el resultado de una transacción incluida. `status: 1` indica ejecución exitosa.

**Qué vas a ver.** La consulta muestra red, dirección, propietario y **Valor: 0**. El propietario debe ser la dirección de la cuenta 0. El verificador muestra su informe y lo guarda en `resultados/verificacion-deployment.json`.

**Antes de seguir.** Deben coincidir la red y dirección del registro con lo consultado. Distinguí tres cosas: un fuente en disco, un artifact compilado y una instancia en el nodo. La verificación acredita creación e identidad. Los tests del paso 3 comprueban además las reglas de las funciones.

## 7. Incrementar como Bruno y probar su límite de permiso

**Qué hacés.** En la terminal 2, ejecutá una línea y observá su resultado antes de seguir:

```sh
npm run usar:contador -- incrementar --cuenta 1
npm run usar:contador -- incrementar --cuenta 1
npm run consultar
```

**Qué ocurre por detrás.** El cliente usa la dirección y ABI del registro. `--cuenta 1` elige a Bruno. El primer `--` permite pasarle esos argumentos al script. Cada incremento es una escritura: se envía, se espera su recibo y se lee el valor posterior.

**Qué vas a ver.** Primero **0 → 1** y después **1 → 2**. En cada operación aparecen cuenta, hash, recibo exitoso y valor posterior. La consulta final lee 2. No es un número que el script decidió imprimir sin consultar: proviene del contrato.

Ahora ejecutá:

```sh
npm run usar:contador -- reiniciar --cuenta 1
npm run consultar
```

**Qué ocurre por detrás del rechazo.** El contrato comprueba que Bruno no es el propietario y rechaza con `NoAutorizado`. La estimación de gas puede detectar ese rechazo antes de enviar la transacción, por lo que puede no existir hash ni recibo del intento.

**Qué vas a ver.** Un comando que termina con error e identifica **NoAutorizado**, seguido de una consulta que conserva **2**. En esta prueba negativa el rechazo es lo esperado.

**Antes de seguir.** Conservá tanto el motivo del rechazo como la lectura posterior. `ECONNREFUSED` indicaría conexión imposible y no demostraría el permiso. `PendienteDeImplementacion` indicaría que abriste una plantilla distinta de la copia guiada. No reinicies todavía como Ana: necesitamos dejar el valor en 2 para el próximo experimento.

## 8. Separar nodo detenido de contrato inexistente

**Qué hacés.** Guardá primero la lectura en 2. En la terminal 1 detené **tu nodo** con `Ctrl+C`. En la terminal 2 ejecutá `npm run consultar` y observá la falla. Después volvé a iniciar el nodo en la terminal 1 con `npm run nodo`.

En la terminal 2, **antes de volver a desplegar**:

```sh
npm run consultar
npm run verificar:deployment
```

**Qué ocurre por detrás.** Al detener el proceso deja de responder el RPC. Los archivos siguen en disco. Al iniciarlo de nuevo, esta configuración local crea una sesión de estado nueva. La dirección del archivo de registro sigue siendo la anterior, pero el contrato no se ha creado en esta sesión.

**Qué vas a ver.** Con nodo detenido: error de conexión. Con nodo nuevo: la consulta informa ausencia de código y el verificador rechaza el registro viejo. Su mensaje general no diagnostica por sí solo la causa, por eso conservás la salida específica de consultar.

**Antes de seguir.** No escribas “ahora vale cero”. **Todavía no hay un contador que se pueda leer allí.** El reinicio de este entorno efímero no describe el reinicio habitual de un nodo de una red pública que conserva su base de datos.

## 9. Crear otro contador y explicar la comparación

**Qué hacés.** En la terminal 2:

```sh
npm run desplegar
npm run consultar
npm run verificar:deployment
```

**Qué ocurre por detrás.** La creación vuelve a ejecutar el constructor y prepara un estado inicial nuevo. Si se repiten cuenta y nonce, la dirección puede repetirse. El nonce cuenta las transacciones enviadas por esa cuenta. Una dirección repetida no recupera el valor anterior.

**Qué vas a ver.** Código presente y **Valor: 0**. Es una instancia nueva, aunque la dirección se parezca o coincida con la anterior.

**Antes de seguir.** Completá esta comparación con tus resultados reales:

| Momento | RPC | Código en la dirección registrada | Qué podés afirmar |
|---|---|---|---|
| Después de los incrementos | Responde | Presente | El contador vale 2. |
| Nodo detenido | No responde | No comprobable | No puedo consultar el estado. |
| Nodo nuevo sin desplegar | Responde | Ausente | No existe el contrato allí. No hay valor que leer. |
| Nueva creación | Responde | Presente | El contador nuevo vale 0. |

Podés continuar con 05 manteniendo tu nodo abierto. Si terminás aquí, detenelo con `Ctrl+C`.

## Qué entregar y qué se aprende

No se evalúa completar código en esta práctica. Entregá una explicación breve con versiones, red, dirección, hash y una tabla de **paso, actor, acción, esperado, observado y evidencia**. Guardala fuera de `laboratorio/practicas`, por ejemplo junto al laboratorio en tu repositorio. La copia de ejecución y sus resultados locales no se incluyen automáticamente en Git.

Respondé: ¿qué hizo la compilación?, ¿qué creó el despliegue?, ¿dónde estaba el valor 2?, ¿por qué los archivos sobrevivieron pero el contrato no?, ¿qué demuestra NoAutorizado? Las pruebas automáticas no evalúan por sí solas esas explicaciones ni asignan notas en Moodle.

## Una comparación final opcional

Si querés ver el reinicio autorizado sin apagar la red, llevá una instancia a 2 y ejecutá `npm run usar:contador -- reiniciar --cuenta 0`. Ana obtiene recibo exitoso y valor 0, pero el contrato sigue presente. Compará esa llamada con reiniciar el proceso del nodo.

## Material relacionado

- [Apunte de la unidad](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-04.html)
- [Actividad de observación](../../actividades/unidad-04.md)
- [Código completo del contador](../../laboratorio/ejemplos/guiado-04-05/Contador.sol)
- [Preparación general](../../laboratorio/README.md)
