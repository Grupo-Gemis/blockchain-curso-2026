# Unidad 08 · Token de laboratorio y white paper

Se conserva la producción escrita del aula y se incorpora evidencia del contrato. El caso usa TokenAula en una red local, sin oferta real ni precio de mercado.

## Preparación

Dependencias instaladas. Completar el constructor de TokenAula antes de consultar la emisión.

Los comandos se ejecutan desde la carpeta `laboratorio` del repositorio.

```sh
npm run compilar
npm test -- ERC20
npm run token
```

## Trabajo autónomo

1. Completá el constructor de TokenAula para emitir exactamente 1.000.000 tokens al receptor. La cantidad debe estar expresada en unidades mínimas y el contrato no debe exponer una emisión posterior.
2. Compilá y desplegá TokenAula con el script del laboratorio. Consultá nombre, símbolo, decimales y totalSupply.
3. Convertí 1.000.000 tokens a unidades mínimas con 18 decimales.
4. Transferí 10 AULA entre dos cuentas de prueba y comprobá ambos saldos y totalSupply.
5. Completá la plantilla white-paper.md con problema, usuarios, arquitectura, token, distribución, gobierno, riesgos y pruebas.
6. Compará la distribución propuesta con lo que implementa el constructor. Señalá qué partes requieren operaciones o contratos adicionales.
7. Intercambiá el documento con otro grupo y registrá dos observaciones respaldadas por evidencia.

## Evidencia

White paper de 2 a 4 páginas, tabla de distribución y registro de emisión y transferencia. Mantener la revisión entre pares prevista en el original.

## Criterios de comprobación

- La distribución suma 100%.
- La transferencia no altera totalSupply.
- Se distinguen reglas implementadas y decisiones propuestas.

## Extensión

Diseñar, sin prometer que ya está implementado, un calendario de vesting y sus pruebas necesarias.

## Material relacionado

- [Apunte de la unidad](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-08.html)
- [Actividad de aplicación](../../actividades/unidad-08.md)
- [Preparación del laboratorio](../../laboratorio/README.md)

## Saldos y permiso en cada paso

Con el nodo activo, ejecutá `npm run token` desde laboratorio. El script crea una instancia nueva de TokenAula y muestra emisión de 1.000.000 AULA a Ana, transferencia de 10 a Bruno, aprobación de 3 y uso de 2 mediante transferFrom. Quedan Ana con 999.988, Bruno con 12 y permiso restante 1. Intenta estimar otro gasto de 2 y comprueba el rechazo sin envío ni cambios de estado.

El informe está en `laboratorio/resultados/token-local.json`. Identificá llamador, origen y destino de cada transferencia. Los montos se convierten con parseUnits y los decimales del contrato. La distribución propuesta es 50% incentivos de uso, 20% comunidad, 20% reserva y 10% equipo. El constructor entrega todo al receptor y no implementa ese reparto o vesting.

Los tests ERC20 comprueban emisión, escala, saldos, permisos, uso parcial y conservación después del rechazo. La revisión docente evalúa problema, utilidad, arquitectura, distribución, gobierno, riesgos, correspondencia con el código y revisión entre pares del white paper.
