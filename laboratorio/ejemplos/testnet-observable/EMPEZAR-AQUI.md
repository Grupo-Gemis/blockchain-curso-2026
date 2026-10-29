# Del contador a la red compartida

Esta práctica trae el contrato y la interfaz completos. Continúa las unidades 04 y 05. No hay que resolver los ejercicios originales para ejecutar esta copia.

Primero ensayamos en una red local independiente. Después usamos Sepolia para observar una transacción pública, su costo y su historia. La parte pública se realiza con el docente y depende de disponer de saldo de prueba y conexión. La aprobación individual conserva su recorrido local.

Sepolia es una red de prueba compartida por Internet que funciona con nodos y validadores externos a la clase. En el ensayo local, cada computadora que inicia Hardhat tiene su propia red y su propio estado. En modo Sepolia, la página puede seguir abierta desde localhost, pero la wallet se comunica con la red pública. El nodo Hardhat local no valida las operaciones de Sepolia.

La actividad puede compartirse desde varias computadoras que observan o usan la misma dirección de contrato en Sepolia. También puede firmar solo el docente mientras el grupo observa. Eso no convierte a los estudiantes en validadores. La comisión de una transacción incluida se calcula una vez con su gas y precio efectivo, sin multiplicarla por los nodos que verifican.


## Datos concretos de la demostración con wallet

La interfaz con wallet y el script por terminal son alternativas. La interfaz no lee `.env` ni pide claves privadas. En la página y en la wallet se elige Sepolia, con chainId 11155111. La cuenta se selecciona en la wallet. El selector Ana/Bruno de la página pertenece al ensayo local.

| Dato | Qué se usa |
|---|---|
| Cuenta que crea | Una cuenta dedicada con ETH de Sepolia para la comisión. La wallet muestra su dirección pública. |
| Crear Contador | No requiere argumentos de constructor. La interfaz prepara el código y no envía ETH como value. |
| Dirección del contrato y hash de creación | Se obtienen durante el envío y seguimiento de la creación. Para abrir una instancia ajena, se pegan completos los datos compartidos por su creador. |
| Hash a observar | El de la operación que se quiere seguir. La interfaz lo carga al enviar. |
| RPC de contraste | Opcional. Puede quedar vacío. Si se utiliza, debe ser otro acceso HTTPS a Sepolia sin credenciales. |
| Gas y precio | La interfaz estima gas y solicita un margen del 20%. La wallet propone el precio para revisar antes de firmar. El recibo dará el consumo y precio efectivos. |

Cada cuenta firma sus propias operaciones. Una firma es una autorización para una transacción concreta, no un valor fijo que se copie en estos campos. Quien observa por el explorador no necesita firma ni saldo. El gas no se multiplica por la cantidad de nodos que verifican.

## Preparar la copia

Si estás leyendo este archivo dentro de `ejemplos/testnet-observable`, volvé a la carpeta `laboratorio` del repositorio y ejecutá:

```sh
npm run preparar:testnet
```

El comando informa una carpeta `practicas/testnet-observable`. Abrí **esa carpeta** en VS Code y después su archivo `Testnet.code-workspace`. El preparador conserva las copias anteriores. Para crear otra copia usá `npm run preparar:testnet -- --nombre otro-ensayo` desde el laboratorio original.

Dentro de la copia nueva, con Node.js 24 LTS:

```sh
npm run preparar
```

Este comando instala las versiones fijadas, compila el contrato y ejecuta seis pruebas locales. Las pruebas arrancan su propio nodo temporal y lo cierran al terminar. No consultan Sepolia. La primera instalación necesita Internet.

## Abrir el ensayo local

Desde la copia preparada:

```sh
npm start
```

El iniciador compila y abre juntos nodo e interfaz. Abrí <http://127.0.0.1:4373> y dejá esa terminal abierta. Ctrl+C detiene ambos servicios. Si el puerto está ocupado, el iniciador lo informa y conserva el servicio existente. Las tareas numeradas de VS Code también permiten iniciar nodo e interfaz por separado.

| Servicio | Dirección | Función |
|---|---|---|
| Nodo del ensayo | `127.0.0.1:19745` | Ejecuta las transacciones locales. |
| Interfaz | `127.0.0.1:4373` | Sirve la DApp al navegador. |
| Nodo temporal de tests | `127.0.0.1:19746` | Se usa y cierra al ejecutar `npm test`. |

Los laboratorios 04/05 conservan sus puertos 8545 y 4173. Sus nodos y contratos son independientes de esta práctica.

Continuá con [GUIA-06-07.md](GUIA-06-07.md). Para detener un servicio, usá Ctrl+C en su propia terminal. No compartas las cuentas de desarrollo del nodo local como cuentas públicas de Sepolia.

## Manual y práctica de nodos

El [tutorial completo en PDF](tutorial/Tutorial_Sepolia_paso_a_paso.pdf) y su [versión editable](tutorial/Tutorial_Sepolia_paso_a_paso.docx) documentan la demostración de dos cuentas. La preparación del manual usa la misma copia resuelta y los mismos comandos. Las capturas son evidencia fechada y los servicios externos pueden cambiar.

Para experimentar propuesta, comprobación, votos y quórum con diez estudiantes, seguí la [red de aula](../red-aula/README.md) desde la carpeta de ejemplos del repositorio. Esa simulación tiene su propio coordinador y puerto 4780.
