# Unidad 04 · Nodo local y despliegue del contador

Se continúa con el Contador de la unidad 03. Ana es la cuenta local 0 y Bruno la cuenta 1. La práctica conecta archivos, compilación, nodo, instancia y pruebas. Termina cuando otra persona puede repetir la secuencia y explicar qué se conserva después de un reinicio.

## Preparación

Contador implementado, Node.js 24 y una copia del repositorio del curso. No se requiere resolver TokenAula ni las unidades posteriores.

Los comandos se ejecutan desde la carpeta `laboratorio` del repositorio. Las rutas que comienzan con `laboratorios/` se refieren a la raíz del repositorio.

```sh
npm ci
npm run verificar
npm run compilar
npm test -- Contador
```

## Trabajo autónomo

1. Guardá las versiones y el resumen de compilación que aparece en esa terminal. Abrí `artifacts/contracts/Contador.sol/Contador.json` e identificá ABI y bytecode. `No contracts to compile` puede indicar que no hay cambios pendientes. Una compilación exitosa no demuestra que los TODO estén resueltos.
2. Ejecutá `npm test -- Contador`. Leé los casos y el resultado en la terminal. El launcher usa un nodo temporal en **18545** y lo cierra al terminar. No cambia la instancia del nodo **8545** que utilizará la interfaz.
3. En una primera terminal, desde `laboratorio`, ejecutá `npm run nodo` y mantenela abierta. El RPC escucha en `http://127.0.0.1:8545` y usa chainId **31337**.
4. En una segunda terminal, también desde `laboratorio`, ejecutá `npm run desplegar`. Registrá red, dirección y hash de creación. El script crea solo Contador y actualiza `ui/despliegue.json` con esos datos y la ABI.
5. En la segunda terminal ejecutá `npm run consultar` y `npm run verificar:deployment`. La consulta debe mostrar propietario de la cuenta 0 y valor inicial 0. La verificación comprueba creación, red, código y lectura y guarda `resultados/verificacion-deployment.json`.
6. Detené únicamente tu nodo con `Ctrl+C`, volvé a iniciarlo y ejecutá **consultar y verificar antes de volver a desplegar**. Registrá el rechazo del registro anterior y la ausencia de código en esa sesión.
7. Ejecutá de nuevo desplegar, consultar y verificar. Compará la creación anterior con la nueva y explicá por qué el valor vuelve a cero. La dirección puede repetirse si se repiten la cuenta y el nonce. Eso no recupera el estado anterior.

## Resultado de cada etapa

| Etapa | Dónde se observa | Qué acredita |
|---|---|---|
| Instalación | Terminal y node_modules | Dependencias fijadas disponibles. |
| Compilación | Terminal y artifacts | Fuente compilable y resultados locales. |
| Tests de Contador | Terminal | Transiciones y rechazo previstos en los casos programados. |
| Inicio del nodo | Primera terminal | Servicio RPC local activo. |
| Deployment | Segunda terminal y ui/despliegue.json | Nueva creación y registro de identidad. |
| Consulta | Segunda terminal | Código presente, propietario y valor actuales. |
| Verificación | Terminal y resultados/verificacion-deployment.json | Coherencia entre red, recibo, creación, código y lectura. |

## Qué se comprueba automáticamente

Los tests de Contador comprueban valor inicial, dos incrementos, nuevoValor de un evento, rechazo de reinicio desde otra cuenta con estado conservado y reinicio del propietario. La verificación del deployment comprueba su identidad y lectura. No asignan una nota ni la envían a Moodle.

La explicación del entorno, el diagnóstico del reinicio, la comparación de evidencias y el informe requieren revisión docente. El workflow general de GitHub ejecuta solo los casos indicados en `.github/workflows/comprobaciones.yml`. Un resultado verde no demuestra que estén resueltos todos los laboratorios.

## Evidencia

README propio con versiones, comandos, tabla de resultados esperados y observados, red, dirección y hash de creación. Incluí la comparación antes y después de reiniciar y redesplegar. No incluir claves mostradas por el nodo ni recovery phrases. Los archivos generados quedan fuera de Git, por lo que la evidencia pertinente se resume en el informe o se adjunta donde indique la entrega.

## Criterios de comprobación

- El RPC responde con chainId 31337.
- La dirección desplegada contiene código.
- Los rechazos de permisos se comprueban explícitamente.
- Se distingue el nodo de tests de la instancia utilizada por la interfaz.
- Se consulta el registro viejo antes de redesplegar y se explica la posibilidad de repetir una dirección.

## Extensión

Cambiar el puerto de la red local y documentar todos los lugares que deben actualizarse.

## Material relacionado

- [Apunte de la unidad](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-04.html)
- [Actividad de aplicación](../../actividades/unidad-04.md)
- [Preparación del laboratorio](../../laboratorio/README.md)
