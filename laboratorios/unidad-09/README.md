# Unidad 09 · Comparación de dos bóvedas locales

Se estudian dos contratos propios del laboratorio. BovedaVulnerable permite observar un orden inseguro. BovedaSegura corrige el estado antes de la llamada y aplica protección contra reentrancy.

## Preparación

Dependencias instaladas. Completar BovedaSegura antes de exigir que pase su test.

Los comandos se ejecutan desde la carpeta `laboratorio` del repositorio.

```sh
npm run compilar
npm test -- Boveda
```

## Trabajo autónomo

1. Leé BovedaVulnerable y el receptor de prueba. Escribí la invariante que deberían cumplir los retiros.
2. Implementá retirar en BovedaSegura. Debe conservar los depósitos ajenos y no permitir recuperar más que el saldo acreditado. Usá checks-effects-interactions y el guard provisto. La versión vulnerable y el receptor de prueba se utilizan solo en la red local.
3. Ejecutá npm test -- Boveda para correr la demostración en una red aislada. Identificá los casos de reentrancy.
4. Compará cuánto recupera el contrato de prueba con el depósito inicial en cada versión.
5. Localizá la llamada externa y la actualización del saldo. Explicá cuál sucede primero.
6. Completá un informe con condición, impacto, evidencia, corrección y resultado de la prueba.
7. Revisá también el permiso de Contador y la afirmación de privacidad de una variable private.

## Evidencia

Informe de seguridad con dos hallazgos o controles, referencias al código y salida de las pruebas. El contrato vulnerable se usa solo en la red local del laboratorio.

## Criterios de comprobación

- El informe explica la causa del comportamiento observado.
- La versión segura conserva la invariante de retiro.
- La prueba comprueba que no se retire más que el saldo propio.

## Extensión

Agregar una pausa a una operación concreta y definir quién puede activarla, quién puede retirarla y qué funciones siguen disponibles.

## Material relacionado

- [Apunte de la unidad](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-09.html)
- [Actividad de aplicación](../../actividades/unidad-09.md)
- [Preparación del laboratorio](../../laboratorio/README.md)

## Qué comprueban las secuencias

La prueba prepara 5 ETH de Ana y 1 ETH de un receptor propio. En la versión vulnerable el receptor obtiene 4 y la bóveda conserva 2, aunque Ana todavía tiene crédito de 5. En la segura obtiene 1 y quedan 5 para Ana. El test consulta fondos y créditos de ambos participantes.

Un segundo receptor, ReceptorRechaza, rechaza recibir fondos. El test comprueba que se conserve su crédito de 1 y los fondos totales de 6. Después cambia su comportamiento y vuelve a solicitar el retiro. Debe poder recibir 1 sin afectar los 5 ajenos. Este contrato es una herramienta de prueba. No se completa como solución del ejercicio.

Los tests ejecutan estas secuencias y sus afirmaciones. La revisión docente evalúa condición, impacto, evidencia, explicación del orden, corrección y alcance. Aprobar el caso BovedaVulnerable significa reproducir la falla esperada, no demostrar que esa versión sea segura.
