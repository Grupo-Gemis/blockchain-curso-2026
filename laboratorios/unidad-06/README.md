# Unidad 06 · Planilla del costo de despliegue

La plantilla CSV se completa en LibreOffice Calc o Google Sheets. Los importes son supuestos didácticos. La medición se realiza en la red local y no requiere pagos.

## Preparación

Contador implementado. Nodo local activo, contratos compilados y deployment vigente.

Los comandos se ejecutan desde la carpeta `laboratorio` del repositorio. Las rutas que comienzan con `laboratorios/` se refieren a la raíz del repositorio.

```sh
npm run medir
```

## Trabajo autónomo

1. Ejecutá npm run medir con el nodo activo y contratos compilados. Registrá qué operación se midió y con qué versión.
2. Abrí laboratorios/unidad-06/plantilla-costos.csv en una hoja de cálculo gratuita. Conservá las entradas y completá las filas de resultado con fórmulas.
3. Resolvé el ejemplo fijo de 50.000 gas, base 20 gwei, propina máxima 2 gwei, max fee 30 gwei y gas limit 80.000.
4. Compará comisión efectiva y reserva máxima. Explicá por qué difieren.
5. Agregá los costos de desarrollo e infraestructura del caso ficticio e identificá su fuente o supuesto.
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

## Leer los resultados y distinguir la corrección

El script crea otra instancia de Contador para medirla. No reemplaza `ui/despliegue.json`. En la terminal se ven cuatro filas: creación, incremento 0 → 1, incremento 1 → 2 y reinicio 2 → 0. El archivo `laboratorio/resultados/gas-local.json` conserva red, dirección, settings y un campo `registros` con estados, gas usado, límite, precio, comisión y hash. Las rutas de resultados se abren desde la carpeta laboratorio.

Completá el presupuesto con estos supuestos ficticios: ocho horas de trabajo a USD 20 por hora, USD 30 de preparación inicial, USD 12 de infraestructura por mes y conversión de USD 2.000 por ETH. El recibo de 0,0011 ETH daría USD 2,20, pero para presupuestar tu deployment utilizá su recibo de creación medido. Separá total inicial y gasto mensual.

Importá el CSV respetando encabezado, comas como separador y la convención decimal de tu hoja. Conservá las entradas. En el modelo EIP-1559 calculá primero el mínimo entre el máximo por gas y base más propina, solo si el máximo cubre la base. Después calculá gas usado × precio efectivo ÷ 10^9 y, por separado, límite × máximo ÷ 10^9. No inventes una comisión de inclusión si la base supera el máximo.

`npm test -- Costos` comprueba funciones programadas. No lee ni califica el CSV. La revisión docente comprueba fórmulas, unidades, escenarios, fuentes, explicación y presupuesto.


## Práctica conjunta de las unidades 06 y 07

La [guía completa de gas, transacciones e historia](../../laboratorio/ejemplos/testnet-observable/GUIA-06-07.md) continúa el contador de 04/05. Desde laboratorio, ejecutá npm run preparar:testnet y seguí EMPEZAR-AQUI.md de la copia. El código está completo y los ejercicios originales se conservan.

Primero ensayamos localmente. Luego el docente guía la creación en Sepolia, los incrementos, la comisión efectiva, la reversión incluida, la consulta desde otra computadora, la historia y el seguimiento de finalización. Quienes no firman pueden observar desde el explorador. La entrega local conserva los criterios anteriores cuando no hay recursos públicos gratuitos.

La evidencia adicional distingue red local y Sepolia. Incluye tabla de operaciones, recibos y JSON de observaciones, más una explicación de qué permiten comprobar dos accesos RPC y qué requiere observar el consenso. Los tests locales no acreditan haber ejecutado la parte pública.


## Participación de diez nodos didácticos

La [red de aula](../../laboratorio/ejemplos/red-aula/README.md) permite experimentar selección de transacciones, propuesta, comprobación independiente y atestaciones. En diez turnos todos pueden proponer. El certificado requiere siete votos distintos y la guía explica su finalidad simplificada.

El [ejemplo resuelto del Contador](../../laboratorio/ejemplos/testnet-observable/README.md) incluye el tutorial completo en PDF y Word. Las dos prácticas tienen código terminado y conservan los ejercicios originales.
