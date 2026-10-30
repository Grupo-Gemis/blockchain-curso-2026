# Unidad 08 · Token de laboratorio y white paper

La actividad conecta emisión, transferencias, permisos y gas con afirmaciones comprobables de un white paper. Usa TokenAula en una red local, con ETH ficticio y sin oferta real ni precio de mercado.

## Elegir el recorrido

**Práctica guiada completa:** [Token observable](../../laboratorio/ejemplos/token-observable/README.md) trae el contrato terminado, interfaz y nueve pruebas. Es la entrada recomendada para observar qué ocurre antes de implementar. No requiere MetaMask. Cada computadora inicia su propia cadena y no comparte consenso con las demás.

Desde la raíz del repositorio, con Node.js 24 LTS:

```sh
cd laboratorio/ejemplos/token-observable
npm run preparar
npm start
```

Abrí http://127.0.0.1:4388 y seguí el [tutorial completo](../../laboratorio/ejemplos/token-observable/GUIA-08.md). La preparación instala dependencias y compila. La primera ejecución necesita Internet. Después la biblioteca del navegador se sirve desde esta misma carpeta.

**Ejercicio de implementación:** el constructor de `laboratorio/contracts/TokenAula.sol` conserva su TODO. Completalo si elegís programar la emisión. Desde `laboratorio`, con sus dependencias instaladas y el nodo del laboratorio activo:

```sh
npm run compilar
npm test -- ERC20
npm run token
```

El ejemplo guiado y ese ejercicio usan carpetas y puertos diferentes. No copies sus resultados como si fueran una única instancia.

## Trabajo autónomo

1. Antes de ejecutar, predecí oferta, saldos, permiso y pagador de gas para cada paso.
2. Creá una instancia con 1.000.000 AULA para Ana. Comprobá nombre, símbolo, decimales, totalSupply y evento inicial. Identificá red y dirección del contrato.
3. Explicá por qué la oferta equivale a 10 elevado a 24 unidades mínimas. Probá la conversión exacta de 0,5 AULA y distinguí una unidad mínima de un token completo.
4. Ana transfiere 10 a Bruno y aprueba un permiso finito de 3 para Bruno. Explicá por qué aprobar no mueve tokens.
5. Bruno usa 2 desde Ana hacia Carla. Identificá llamador, origen y destino. Consultá el permiso restante y el ETH de quien pagó.
6. Compará la simulación rechazada de otros 2 con su envío mediante límite explícito. Distinguí hash, recibo, status, nonce y comisión. Luego Ana revoca el permiso restante a cero.
7. Completá la [plantilla de white paper](../../laboratorio/white-paper.md). Contrastá distribución 50/20/20/10, vesting y servicio prometido con el código disponible.
8. Intercambiá el documento con otra persona y registrá dos observaciones con evidencia. Con diez estudiantes se pueden formar cinco parejas. Para otros tamaños, usá parejas o un grupo de tres.

## Estado esperado de la copia guiada

Cada fila parte de la anterior. La oferta permanece en 1.000.000 AULA.

| Paso | Ana | Bruno | Carla | Permiso Ana → Bruno |
|---|---:|---:|---:|---:|
| Emisión a Ana | 1.000.000 | 0 | 0 | 0 |
| Transferir 10 | 999.990 | 10 | 0 | 0 |
| Aprobar 3 | 999.990 | 10 | 0 | 3 |
| Usar 2 hacia Carla | 999.988 | 10 | 2 | 1 |
| Estimar otros 2, rechazo | 999.988 | 10 | 2 | 1 |
| Enviar otros 2, reversión | 999.988 | 10 | 2 | 1 |
| Revocar a cero | 999.988 | 10 | 2 | 0 |

El intento incluido que revierte paga gas en ETH y consume un nonce de Bruno. La simulación no publica una transacción. El tutorial explica cómo distinguirlos en el informe.

En el recorrido anterior `npm run token`, Bruno también es el destinatario de transferFrom. Por eso termina con 12 AULA y no hay una entrega a Carla. Su informe es `laboratorio/resultados/token-local.json`. Ambos casos son válidos y tienen destinatarios diferentes.

## Entrega y revisión

- White paper de 2 a 4 páginas, sin contar anexos de evidencia.
- Tabla de distribución que sume 100% y matriz de afirmaciones implementadas, propuestas y dependientes de un servicio externo.
- Informe JSON exportado desde la interfaz, más una explicación breve de dos operaciones. Si elegiste la implementación original, entregá `token-local.json` y señalá qué pasos adicionales no ejecutaste.
- Dos observaciones de revisión entre pares y la corrección o respuesta correspondiente.

Las nueve pruebas de la copia guiada comprueban comportamiento del contrato y del registro de operaciones. La revisión docente evalúa la correspondencia entre problema, utilidad, arquitectura, permisos, distribución, gobierno, riesgos y evidencia. Un test aprobado no demuestra que el servicio exista ni envía una nota a Moodle.

## Ampliaciones

Comprobar un creador distinto del receptor, el reemplazo de una aprobación y una fracción mínima. Analizar una autorización máxima y un calendario de vesting como extensiones. El contrato base no implementa vesting, votación, venta ni emisión posterior.

## Material relacionado

- [Apunte de la unidad](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-08.html)
- [Actividad de aplicación](../../actividades/unidad-08.md)
- [Preparación del laboratorio original](../../laboratorio/README.md)
