# Unidad 11 · Redes, criptomonedas y sistema financiero

Esta práctica consiste en explicar un recorrido económico y comparar redes con evidencia. Se resuelve con el apunte y fuentes públicas. No necesita cuentas nuevas, wallets, compras ni transferencias.

## Lectura y presentación

Abrí `docs/unidad-11.html` en la copia del material del curso. Los botones Lectura y Presentación permiten cambiar de vista. El índice reúne los temas y los gráficos se pueden ampliar.

## Parte 1. El pago entre Ana y Bruno

Ana compra 100 USDT con pesos en un exchange. La compra queda registrada en la contabilidad interna del servicio. Bruno admite USDT por TRON. El exchange ofrece retiros por Ethereum y por TRON. Ana solicita retirar 100 USDT por TRON. El servicio descuenta una comisión de retiro supuesta de 1 USDT de esas 100 unidades.

1. Identificá el banco, el exchange, la red, el token, el emisor y el activo utilizado para los recursos de la red.
2. Explicá qué registros cambian en la compra y en el retiro. Indicá si necesariamente se emiten nuevos USDT.
3. Calculá cuánto debería recibir Bruno. Separá la comisión de retiro del costo de la transacción blockchain.
4. Indicá quién envía la transacción de retiro y qué comprobante permite buscarla en un explorador.
5. Explicá qué falta para que Bruno reciba pesos en su banco. Distinguí una venta al intermediario de un rescate directo ante el emisor.
6. Analizá qué cambia si Ana elige Ethereum aunque el servicio de Bruno solo admita TRON. No supongas que una operación válida se acreditará en el servicio de destino.

## Parte 2. Comparación de redes

Elegí una de Ethereum mainnet, Polygon PoS, BNB Smart Chain, Avalanche C-Chain, Arbitrum One, OP Mainnet o Base. Comparala con TRON, Solana, Cardano o Bitcoin.

Completá la ficha para ambas redes:

| Campo | Red elegida A | Red elegida B |
|---|---|---|
| Nombre concreto de la red | | |
| Origen y problema que buscó resolver | | |
| Activo nativo y función | | |
| Modelo de ejecución de programas | | |
| Relación con otras redes | | |
| Un token o aplicación y su identificador público | | |
| Autoridades o servicios de los que depende | | |
| Fuente oficial y fecha de consulta | | |

Si analizás un token, verificá red e identificador oficial. No uses solo su nombre o logo. Si una red no admite el mismo tipo de contrato que la otra, explicá esa diferencia. No hace falta encontrar un equivalente artificial.

## Parte 3. La propuesta de la cooperativa

Una cooperativa crea un millón de AULA y anuncia que cada unidad vale un dólar. Redactá una ficha que distinga lo implementado, lo propuesto y la evidencia faltante.

- Quién recibe las unidades iniciales y quién puede emitir después.
- Qué puede hacer una persona con AULA y quién presta ese servicio.
- Qué mecanismo conecta la promesa de un dólar con reservas y rescate.
- Quién controla cambios, pausas y claves.
- Qué costos se pagan en AULA y cuáles en el activo nativo de la red.
- Qué cambia si el proyecto crea un mercado con un precio de referencia.

## Entrega y revisión

Entregá el recorrido explicado, las dos fichas de redes y la ficha de la cooperativa. Citá las páginas que sostienen cada dato y su fecha de consulta. Marcá los supuestos numéricos.

Se revisa la distinción entre actores y registros, el cálculo del caso, la identificación de redes y activos, la calidad de las fuentes y la relación entre una promesa y su mecanismo. No hay un test de código que corrija esas explicaciones ni un envío automático de notas.

## Parte 4. Rendimientos y préstamo con garantía

Carla aporta liquidez y Bruno pide prestadas 100 unidades de una stablecoin, valuadas en 100 USD para el ejemplo. La garantía inicial vale 150 USD. Se supone un umbral de liquidación del 80%, sin intereses acumulados ni costos en esta tabla.

1. Calculá la cobertura como valor de garantía × 0,80 / deuda con valores de garantía de 150, 130 y 120 USD.
2. Indicá en qué escenario la cobertura queda por debajo de 1 y qué puede habilitar esa condición.
3. Explicá quién paga intereses y qué necesita Bruno para cerrar la posición y liberar su garantía.
4. Compará un interés pagado por prestatarios, una comisión de intercambio y un incentivo en tokens recién emitidos.
5. Para una tasa anual simple supuesta del 10% sobre 1.000 unidades durante un año, calculá el interés sin costos. Indicá qué datos faltan para conocer el resultado disponible.

Los parámetros son ficticios. No se requiere abrir una posición ni reproducir una cotización actual.

## Parte 5. Activos externos, privacidad y circuito argentino

Para una participación tokenizada en un fondo ficticio, identificá activo, custodio, derecho del tenedor, restricciones de transferencia y condiciones de rescate. Comparala con una stablecoin y con un saldo custodiado en un exchange.

Elegí una dirección pública incluida en el aviso del FBI del caso Binance y consultala en el explorador de la red indicada. Conservá la URL, dirección, red y fecha de consulta. Si elegís una transacción, registrá también su hash y resultado. Separá lo observable de las etiquetas del explorador y de las afirmaciones del aviso. La actividad no requiere conectar una wallet.

Para el circuito local, distinguí banco, cuenta de pago, PSAV y wallet de autocustodia. Registrá dónde consultarías la razón social del proveedor y qué documento necesitarías para identificar quién custodia cada saldo. Explicá las funciones diferentes de CNV, BCRA, UIF y ARCA.

## Parte 6. El incidente de Binance del 29 de octubre de 2026

Prepará una ficha con el corte de información del 3 de noviembre de 2026:

| Campo | Análisis y evidencia |
|---|---|
| Fecha del incidente y fecha de cada informe | |
| Componente comprometido | |
| Actores, redes y activos involucrados | |
| Qué describe el análisis de las firmas | |
| Cifras con fuente y fecha, sin sumarlas entre sí | |
| Congelamiento, recuperación y reposición | |
| Observación técnica, declaración de la empresa y atribución del FBI | |
| Qué queda bajo investigación | |

Explicá por qué una firma criptográficamente válida puede formar parte de una salida no consentida. Compará el componente comprometido con los casos UST y FTX. Si utilizás una actualización posterior al corte de la unidad, señalá expresamente qué dato cambia y qué evidencia lo sostiene.

Se amplía la entrega con las respuestas del préstamo y las fichas de tokenización, privacidad, circuito argentino e incidente. La revisión valora cálculos con supuestos, distinción de responsabilidades y atribución de cada afirmación.
