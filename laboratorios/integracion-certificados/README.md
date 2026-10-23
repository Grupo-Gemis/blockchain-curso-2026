# Integración de certificados verificables

Esta práctica relaciona el modelo de la unidad 03, la arquitectura de la unidad 05, las mediciones de 06/07 y la revisión de seguridad y costos de 09/10. El código está completo. Se evalúan la comprensión, las observaciones y las decisiones justificadas.

El [material de integración](https://grupo-gemis.github.io/blockchain-curso-2026/integracion.html) reúne el desarrollo en lectura y presentación. La [guía paso a paso](../../laboratorio/ejemplos/integrador-certificados/EMPEZAR-AQUI.md) explica qué hacer, qué ocurre, qué deberías observar y cómo continuar. El docente indica cuándo desarrollar cada parte.

## Preparación

Desde `laboratorio` del repositorio, ejecutá `npm run preparar:certificados` y entrá en `practicas/certificados`. Abrí la guía de esa copia. No trabajes directamente sobre la fuente del ejemplo. El preparador conserva las copias existentes.

Todo el recorrido es local. La aplicación usa el nodo de 19645 y la interfaz de 4273. Las pruebas utilizan otro nodo temporal, en 19646. No requiere wallet externa, servicios pagos, fondos reales ni el contador resuelto.

## Matriz de observaciones

Antes de cada acción completá el resultado esperado. Después registrá lo observado y una evidencia que permita comprobarlo. Identificá red, dirección y cuenta cuando cambie el contexto. Una captura del mismo número sin esos datos no demuestra que corresponda a la misma instancia.

| Caso | Precondición y acción |
|---|---|
| C1 | Registro nuevo. Consultar la huella del original. |
| C2 | Bruno intenta emitir el original. Consultar después. |
| C3 | Ana emite el original. Esperar recibo y consultar. |
| C4 | Consultar el alterado y volver a consultar el original. |
| C5 | Ana intenta emitir otra vez el original. Consultar después. |
| C6 | Interrumpir la descarga del original y consultar su huella guardada. |
| C7 | Restaurar la descarga y comparar su huella. |
| C8 | Bruno intenta revocar el original vigente. Consultar después. |
| C9 | Ana revoca. Consultar y comprobar emisor. |
| C10 | Ana intenta reemitir el original revocado y revocarlo otra vez. |
| C11 | Descargar el original después de revocarlo. |
| C12 | Ejecutar el recorrido automático y comparar las direcciones. |
| C13 | Detener el nodo propio, intentar consultar y explicar qué deja de conocerse. |
| C14 | Iniciar un nodo nuevo, comprobar el registro viejo antes de redesplegar y consultar la nueva instancia. |

Podés completar [matriz-evidencia.csv](matriz-evidencia.csv) en una planilla. Los estados esperados se predicen desde las reglas del material antes de observar la aplicación. No reemplaces el resultado observado por el que debería haber ocurrido.

## Entrega única

Reuní en un solo informe:

1. Matriz con precondición, actor, acción, esperado, observado y evidencia de C1 a C14.
2. Esquema con archivo, navegador, servidor, nodo y contrato. Explicá qué guarda cada componente.
3. Informe `recorrido-certificados.json`, con una explicación de por qué su dirección difiere de la usada por la página.
4. Presupuesto que separe emisiones, revocaciones y consultas. Usá mediciones propias y supuestos explícitos de frecuencia, precio, conversión e infraestructura.
5. Justificación breve de arquitectura: actores, autoridad aceptada, límites del registro y comparación con una base de datos y documentos firmados.

Se reutiliza la evidencia de las unidades relacionadas. No se pide crear un token ni desarrollar otra aplicación desde cero.

## Criterios de comprobación

- Las predicciones se relacionan con una regla del contrato y las diferencias se explican.
- Los rechazos se identifican por su causa y se comprueba el estado posterior.
- Se distinguen bytes del documento, huella, registro, vigencia y disponibilidad.
- Se identifican las instancias y se conserva la diferencia entre consulta fallida y estado inexistente.
- Las comisiones se calculan con consumo y precio efectivos. El presupuesto separa medición de supuesto.
- La defensa reconoce qué depende de una autoridad externa y justifica la tecnología elegida.

Los tests comprueban las secuencias programadas del contrato. No abren la página, no revisan la planilla ni el informe, no prueban MetaMask y no asignan una nota en Moodle.
