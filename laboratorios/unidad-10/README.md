# Unidad 10 · Planilla de costos por usuario

La plantilla CSV permite modelar costos e ingresos con supuestos ficticios. Se completa en LibreOffice Calc o Google Sheets. Las cifras describen un escenario de negocio y no representan pagos para realizar el laboratorio.

## Preparación

Lectura de las unidades 06 y 10. LibreOffice Calc o Google Sheets.

Los comandos se ejecutan desde la carpeta `laboratorio` del repositorio. Las rutas que comienzan con `laboratorios/` se refieren a la raíz del repositorio.

```sh
npm test -- Costos
```

## Trabajo autónomo

1. Abrí laboratorios/unidad-10/plantilla-uso.csv en una hoja de cálculo. Verificá las entradas del caso base y completá las filas de resultado con fórmulas.
2. Comprobá costo por operación, costo por usuario y costo de red mensual.
3. Con patrocinio igual a 1, verificá costo del usuario, ingresos, gastos y resultado operativo.
4. Cambiá patrocinio a 0 y explicá qué resultados cambian y cuáles permanecen.
5. Restaurá patrocinio a 1. Cambiá operaciones por usuario de 20 a 40 y anticipá el efecto.
6. Explicá por escrito dos supuestos críticos, la evidencia disponible y una limitación del modelo.

## Evidencia

Planilla con fórmulas y explicación de sus supuestos. Adjuntá una tabla con el escenario base y el cambio de una entrada, identificando las entradas utilizadas en cada caso.

## Criterios de comprobación

- La operación base cuesta USD 0,20.
- El gas total del caso base es USD 400 al mes.
- El patrocinio cambia quién paga sin eliminar el costo.

## Extensión

Agregar un costo de soporte por usuario y revisar la contribución y el punto de equilibrio.

## Material relacionado

- [Apunte de la unidad](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-10.html)
- [Actividad de aplicación](../../actividades/unidad-10.md)
- [Preparación del laboratorio](../../laboratorio/README.md)
