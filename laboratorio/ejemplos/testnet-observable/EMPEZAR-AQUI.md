# Del contador a la red compartida

Esta práctica trae el contrato y la interfaz completos. Continúa las unidades 04 y 05. No hay que resolver los ejercicios originales para ejecutar esta copia.

Primero ensayamos en una red local independiente. Después usamos Sepolia para observar una transacción pública, su costo y su historia. La parte pública se realiza con el docente y depende de disponer de saldo de prueba y conexión. La aprobación individual conserva su recorrido local.

## Preparar la copia

Si estás leyendo este archivo dentro de `ejemplos/testnet-observable`, volvé a la carpeta `laboratorio` del repositorio y ejecutá:

```sh
npm run preparar:testnet
```

El comando informa una carpeta `practicas/testnet-observable`. Abrí **esa carpeta** en VS Code y después su archivo `Testnet.code-workspace`. El preparador conserva las copias anteriores. Para crear otra copia usá `npm run preparar:testnet -- --nombre otro-ensayo` desde el laboratorio original.

Dentro de la copia nueva:

```sh
npm ci
npm run compilar
npm test
```

Se necesita el Node.js indicado por el repositorio, como en 04/05. La instalación inicial descarga dependencias. Las pruebas arrancan su propio nodo temporal y lo cierran al terminar. No consultan Sepolia.

## Abrir el ensayo local

En la primera terminal de la copia:

```sh
npm run nodo
```

Dejala abierta. En otra terminal de la misma carpeta:

```sh
npm run interfaz
```

Abrí <http://127.0.0.1:4373>. También podés ejecutar las tareas numeradas desde **Terminal → Ejecutar tarea**. No se inicia ningún servicio al abrir el workspace.

| Servicio | Dirección | Función |
|---|---|---|
| Nodo del ensayo | `127.0.0.1:19745` | Ejecuta las transacciones locales. |
| Interfaz | `127.0.0.1:4373` | Sirve la DApp al navegador. |
| Nodo temporal de tests | `127.0.0.1:19746` | Se usa y cierra al ejecutar `npm test`. |

Los laboratorios 04/05 conservan sus puertos 8545 y 4173. Sus nodos y contratos son independientes de esta práctica.

Continuá con [GUIA-06-07.md](GUIA-06-07.md). Para detener un servicio, usá Ctrl+C en su propia terminal. No compartas las cuentas de desarrollo del nodo local como cuentas públicas de Sepolia.
