# TokenAula: saldos, permisos y evidencia

Práctica completa de la unidad 08. Incluye el contrato resuelto, una interfaz local y nueve pruebas. No hace falta completar código para ejecutarla. La plantilla original del curso continúa separada para quien quiera implementar su constructor.

Se necesita **Node.js 24 LTS**. Desde `laboratorio/ejemplos/token-observable`:

```sh
npm run preparar
npm start
```

Abrí **http://127.0.0.1:4388**. Elegí Ana, pulsá **Conectar** y después **Crear TokenAula**, dejando a Ana como receptora. La primera preparación instala las versiones fijadas, compila y prueba. Requiere Internet para las dependencias y el compilador si no estaban disponibles. La biblioteca de la interfaz se sirve localmente, sin una descarga desde un CDN.

El nodo de la práctica escucha en `127.0.0.1:19685`. Los tests usan otro nodo temporal en `19686`. Ctrl+C en la terminal de arranque detiene los servicios que inició. Un segundo arranque detecta puertos ocupados y conserva los procesos anteriores.

Cada computadora tiene su propia red local y tres cuentas de desarrollo. No es una red entre pares ni una operación en Sepolia. Los fondos son ficticios. El selector Ana, Bruno y Carla elige cuál de esas cuentas firma en el nodo local, sin una wallet externa.

El [tutorial completo](GUIA-08.md) explica preparación, acciones, resultados, gas, errores y evidencias. La [plantilla de white paper](white-paper.md) permite contrastar el prototipo con una propuesta.

Para repetir solo las pruebas:

```sh
npm test
```

Para ejecutar y guardar el recorrido sin usar la página, mantener `npm start` activo y abrir otra terminal en esta carpeta:

```sh
npm run recorrido
```

El informe queda en `resultados/token-observable.json`. Crea otra instancia independiente y no modifica la que estaba seleccionada en el navegador.

Versiones: Solidity 0.8.28, OpenZeppelin Contracts 5.4.0, ethers 6.16.0 y Hardhat 3.16.0. El contrato emite una sola vez 1.000.000 AULA. No implementa el reparto 50/20/20/10, vesting, una venta, un servicio de reservas ni gobierno por votación.
