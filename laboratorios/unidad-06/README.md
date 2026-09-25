# Unidad 06 · Planilla del costo de despliegue

La planilla sustituye los ejemplos no adjuntos en la consigna original. Incluye entradas editables y fórmulas. Todos los importes iniciales son datos de enseñanza, no precios de mercado.

## Preparación

Contador implementado. Nodo local activo, contratos compilados y deployment vigente.

Los comandos se ejecutan desde la carpeta `laboratorio` del repositorio.

```sh
npm run medir
```

## Trabajo autónomo

1. Ejecutá npm run medir con el nodo activo y contratos compilados. Registrá qué operación se midió y con qué versión.
2. Abrí plantilla-costos.csv desde esta carpeta en una hoja de cálculo. Conservá las entradas y completá las filas de resultado con fórmulas.
3. Resolvé el ejemplo fijo de 50.000 gas, base 20 gwei, propina máxima 2 gwei, max fee 30 gwei y gas limit 80.000.
4. Compará comisión efectiva y reserva máxima. Explicá por qué difieren.
5. Agregá filas separadas para desarrollo e infraestructura e identificá los valores como supuestos del presupuesto.
6. Cambiá una entrada de gas o precio y verificá que las fórmulas recalculen el presupuesto.

## Evidencia

Planilla completa y una nota que distinga datos medidos, supuestos y resultados. Adjuntar salida de medición y explicar las diferencias frente al ejemplo fijo.

## Criterios de comprobación

- El ejemplo fijo produce 0,0011 ETH.
- La reserva máxima produce 0,0024 ETH.
- El informe separa despliegue y operación recurrente.

## Extensión

Medir una escritura inicial y otra posterior del mismo contrato y explicar por qué los consumos pueden diferir.

## Material relacionado

- [Apunte de la unidad](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-06.html)
- [Actividad de aplicación](../../actividades/unidad-06.md)
- [Preparación del laboratorio](../../laboratorio/README.md)
