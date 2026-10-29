# Laboratorios de Blockchain

Práctica resuelta de las unidades 06 y 07 del curso UTN. Incluye el contrato Contador, la interfaz, las pruebas y los apuntes actualizados el 28/10/2026. El código está completo. No hace falta resolver los ejercicios de otro repositorio.

## Abrir y ejecutar

Abrí esta carpeta en VS Code. Se necesita Node.js 24 LTS y npm. Si usás nvm, ejecutá `nvm install` y `nvm use` desde esta carpeta.

Si la terminal usa un Node antiguo y existe Node 24 instalado con nvm, los comandos de este laboratorio seleccionan esa versión automáticamente. No cambian la configuración global.

La primera vez, con conexión a Internet:

```sh
npm run preparar
```

Instala las versiones fijadas, compila el contrato y ejecuta las pruebas locales. Después:

```sh
npm start
```

Abrí http://127.0.0.1:4373. El comando inicia juntos el nodo local y la interfaz. Dejá la terminal abierta. Ctrl+C detiene ambos servicios. También podés hacer doble clic en `Abrir laboratorio.command`.

Elegí **Ensayo local**, **Ana**, **Conectar** y **Crear Contador**. Incrementá dos veces y consultá los eventos. Seguí [GUIA-06-07.md](GUIA-06-07.md) para cambiar de cuenta, observar la reversión sin permiso, calcular gas y consultar la historia.

## Qué incluye

- Contrato y aplicación completos en `contracts/` y `ui/`.
- [Guía de preparación](EMPEZAR-AQUI.md) y [recorrido de las unidades 06 y 07](GUIA-06-07.md).
- [Tutorial completo de Sepolia en PDF](tutorial/Tutorial_Sepolia_paso_a_paso.pdf).
- [Tutorial de Sepolia en Word](tutorial/Tutorial_Sepolia_paso_a_paso.docx), con capturas, dos cuentas, envío de saldo, firmas, permisos, contraste RPC y explorador de consenso.
- Apuntes de [unidad 06](materiales/unidad-06.html) y [unidad 07](materiales/unidad-07.html), que se pueden abrir como archivos locales.
- [Plantilla de costos](materiales/plantilla-costos.csv).
- Pruebas reales contra una red local temporal mediante `npm test`.

## Comandos

| Comando | Función |
|---|---|
| `npm run preparar` | Instala si es necesario, compila y prueba. |
| `npm start` | Compila e inicia nodo e interfaz juntos. Instala si faltan las dependencias. |
| `npm run verificar` | Informa versión de Node, archivos y servicios. |
| `npm run compilar` | Compila el contrato. |
| `npm test` | Prueba el contrato y la observación local en el puerto 19746. |
| `npm run medir` | Crea otra instancia y guarda mediciones en `resultados/gas-local.json`. |
| `npm run desplegar` | Crea una instancia por terminal y muestra su dirección y hash. |
| `npm run consultar` | Lee la instancia creada por terminal. |
| `npm run verificar:deployment` | Verifica el registro de creación y guarda evidencia JSON. |
| `npm run nodo` | Inicia solo el nodo en 19745. |
| `npm run interfaz` | Inicia solo la interfaz en 4373. |

## Estado y problemas frecuentes

Al detener el nodo se pierde su estado local. Los datos guardados por el navegador pueden corresponder al ensayo anterior. En ese caso, conectá y pulsá **Crear Contador** otra vez.

Si un puerto está ocupado, el iniciador lo informa y no cierra procesos ajenos. Si ya tenés el laboratorio abierto, usá su página o detené su terminal antes de iniciar otra copia.

Los registros quedan en `resultados/servicios.log`. La caché de npm queda dentro de esta carpeta para evitar problemas de permisos con instalaciones anteriores. `npm ci` permite reinstalar exactamente las versiones fijadas.

## Sepolia

El ensayo local funciona sin wallet ni saldo público. Para operar en Sepolia se necesita una wallet con una cuenta de prueba, la red Sepolia seleccionada y ETH de prueba. La interfaz permite crear el contrato y seguir sus operaciones. No requiere `.env` ni introducir una clave privada.

La alternativa por terminal conserva `npm run sepolia -- --check` y `npm run sepolia -- --desplegar`. Requiere completar una copia de `.env.example` llamada `.env` con un RPC y la clave de una cuenta exclusiva de prueba. La interfaz con wallet no necesita ese archivo.

Los apuntes en `materiales/` describen también el repositorio general del curso. En esta copia se trabaja directamente desde la raíz y el puerto local es 19745. La instancia creada por terminal se puede abrir en la interfaz pegando su dirección y hash. La medición crea otra instancia y conserva el contador abierto en la página.

Las pruebas locales no acreditan una ejecución en Sepolia. La guía distingue ambos recorridos.

El tutorial documenta el recorrido público del 27/10/2026 y conserva sus hashes, recibos, costos y capturas. Es un registro fechado. Una nueva ejecución se comprueba con sus propios recibos y consultas. La preparación de esta copia y sus tests locales no producen nuevas transacciones en Sepolia.

## Participar en el consenso del aula

La [red de aula configurable](../red-aula/README.md) agrega una práctica distinta: cada participante firma operaciones, propone cuando le toca, comprueba y vota desde su copia de la cadena. El Contador continúa funcionando como ejemplo de aplicación sobre una red local o Sepolia.

## Procedencia

Práctica resuelta del repositorio del curso. Puede ejecutarse directamente aquí o preparar una copia independiente con `npm run preparar:testnet` desde la carpeta `laboratorio`. La preparación conserva las copias previas y sus resultados. Los scripts de estudiantes con ejercicios pendientes se mantienen separados.

La [modalidad de nodos independientes](../red-aula/NODOS-INDEPENDIENTES.md) requiere Node.js 24 en cada computadora y se comunica entre pares. Ambas modalidades admiten de 2 a 60 participantes con turnos y quórum adaptados al curso.
