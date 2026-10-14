# Unidad 04 · Nodo local y despliegue del contador

Se continúa con el Contador de la unidad 03. Ana es la cuenta local 0 y Bruno la cuenta 1. La práctica conecta archivos, compilación, nodo, instancia y pruebas. Termina cuando otra persona puede repetir la secuencia y distinguir contador en 2, ausencia de instancia después de reiniciar y nuevo contador en 0.

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
6. Antes de detener el nodo, usá el cliente de terminal para incrementar dos veces como Bruno. Ejecutá cada línea por separado. La consulta final debe mostrar 2:

   ```sh
   npm run usar:contador -- incrementar --cuenta 1
   npm run usar:contador -- incrementar --cuenta 1
   npm run consultar
   ```

   `--cuenta 1` elige B, Bruno. El cliente lee el registro, comprueba la creación y usa la ABI. Muestra cuenta, valor previo, hash, recibo y valor posterior. No resuelve los TODO del contrato. El separador `--` pasa los argumentos al script.
7. Intentá `npm run usar:contador -- reiniciar --cuenta 1`. Con el contador completado debe rechazarse por permiso. El comando termina con error porque la operación no se completó. Esa salida es esperada en este caso. Ejecutá `npm run consultar` y comprobá que el valor siga en 2. Una falla de conexión no demuestra el permiso. Conservá el motivo del rechazo.
8. Detené únicamente tu nodo con `Ctrl+C` en la terminal 1. Volvé a iniciarlo y ejecutá **consultar y verificar antes de volver a desplegar** desde la terminal 2. Registrá la ausencia de código y el rechazo del registro anterior. No atribuyas valor cero a una instancia que todavía no existe.
9. Ejecutá de nuevo desplegar, consultar y verificar. Ahora una instancia nueva comienza en 0. Compará las tres observaciones: 2 antes del reinicio, ausencia de instancia y 0 después de crearla. La dirección puede repetirse si se repiten cuenta y nonce. Eso no recupera el estado anterior.

La terminal 1 queda ocupada por el nodo. La terminal 2 vuelve al prompt después de cada cliente y sirve para el comando siguiente. Si el nodo ya estaba activo en tu propia terminal, utilizá esa sesión en lugar de intentar abrir otro servicio en el mismo puerto.

## Resultado de cada etapa

| Etapa | Dónde se observa | Qué acredita |
|---|---|---|
| Instalación | Terminal y node_modules | Dependencias fijadas disponibles. |
| Compilación | Terminal y artifacts | Fuente compilable y resultados locales. |
| Tests de Contador | Terminal | Transiciones y rechazo previstos en los casos programados. |
| Inicio del nodo | Primera terminal | Servicio RPC local activo. |
| Deployment | Segunda terminal y ui/despliegue.json | Nueva creación y registro de identidad. |
| Consulta | Segunda terminal | Código presente, propietario y valor actuales. |
| Uso del contador | Segunda terminal | Solicitud con cuenta elegida, hash, recibo y lectura posterior. |
| Verificación | Terminal y resultados/verificacion-deployment.json | Coherencia entre red, recibo, creación, código y lectura. |

## Qué se comprueba automáticamente

Los tests de Contador comprueban valor inicial, dos incrementos, nuevoValor de un evento, rechazo de reinicio desde otra cuenta con estado conservado y reinicio del propietario. La verificación del deployment comprueba su identidad y lectura. No asignan una nota ni la envían a Moodle.

La explicación del entorno, el diagnóstico del reinicio, la comparación de evidencias y el informe requieren revisión docente. El workflow general de GitHub ejecuta solo los casos indicados en `.github/workflows/comprobaciones.yml`. Un resultado verde no demuestra que estén resueltos todos los laboratorios.

## Evidencia

README propio con versiones, comandos, tabla de resultados esperados y observados, red, dirección y hash de creación. Incluí las tres observaciones del reinicio, los dos incrementos y el rechazo de Bruno. No incluir claves mostradas por el nodo ni recovery phrases. Los archivos generados quedan fuera de Git, por lo que la evidencia pertinente se resume en el informe o se adjunta donde indique la entrega.

## Criterios de comprobación

- El RPC responde con chainId 31337.
- La dirección desplegada contiene código.
- Los rechazos de permisos se comprueban explícitamente.
- Se distingue el nodo de tests de la instancia utilizada por la interfaz.
- Se consulta el registro viejo antes de redesplegar y se explica la posibilidad de repetir una dirección.

## Extensión

Para observar el reinicio autorizado en la misma sesión, llevá el contador a 2 y ejecutá `npm run usar:contador -- reiniciar --cuenta 0`. A es Ana, la propietaria. Comprobá el recibo y valor 0. Esta llamada es diferente de reiniciar el proceso del nodo.

Cambiar el puerto de la red local y documentar todos los lugares que deben actualizarse.

## Material relacionado

- [Apunte de la unidad](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-04.html)
- [Actividad de aplicación](../../actividades/unidad-04.md)
- [Preparación del laboratorio](../../laboratorio/README.md)
