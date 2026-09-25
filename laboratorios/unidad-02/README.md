# Unidad 02 · Matriz de wallets y recibo de transacción

Se retoman las tres preguntas del DOCX original con criterios que permiten comparar respuestas. La consulta de una transacción real es una extensión. El archivo de ejemplo permite resolver el núcleo sin cuentas externas.

## Preparación

Lectura de la unidad 02. El análisis del JSON no necesita nodo local.

Los comandos se ejecutan desde la carpeta `laboratorio` del repositorio.

```sh
# Datos: datos/transaccion-ejemplo.json
```

## Trabajo autónomo

1. Leé los casos de la actividad sincrónica y clasificá custodia y conectividad por separado.
2. Elegí un caso y anotá el riesgo prioritario, el responsable de recuperación y la evidencia necesaria para autorizar una operación.
3. Abrí datos/transaccion-ejemplo.json. Identificá chainId, from, to, valueWei, status, gasUsed y effectiveGasPriceGwei.
4. Calculá la comisión usando los datos explícitos del ejemplo. Separá esa comisión del valor transferido.
5. Como extensión, compará esos campos con una transacción pública de Sepolia en un explorador. Anotá URL y fecha de consulta.

## Evidencia

Una matriz de comparación y una ficha de transacción. No incluir claves, frases de recuperación ni capturas de información sensible.

## Criterios de comprobación

- Custodia y conectividad figuran en columnas distintas.
- La red de la ficha está identificada.
- La comisión no se confunde con el valor transferido.

## Extensión

Discutí un esquema de firmas múltiples para una organización y qué cambios introduce en recuperación y aprobación.

## Material relacionado

- [Apunte de la unidad](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-02.html)
- [Actividad de aplicación](../../actividades/unidad-02.md)
- [Preparación del laboratorio](../../laboratorio/README.md)
