# Unidad 02 · Wallets y resultado de una transacción

En el [encuentro 02](https://grupo-gemis.github.io/blockchain-curso-2026/encuentro-02.html) Ana utiliza una cuenta de Ethereum. Esta práctica distingue quién puede firmar, qué red se consulta y qué muestra un recibo. Se trabaja con datos del repositorio; no hace falta crear una cuenta ni conectarse a una red pública.

## 1. Comparar tres maneras de operar

Leé los [tres casos de la actividad](../../actividades/unidad-02.md). Prepará una tabla con una fila por caso:

| Caso | ¿Quién controla la firma? | ¿Cómo se utiliza? | ¿Quién puede recuperar el acceso? | Riesgo que revisarías primero |
|---|---|---|---|---|
| A | | | | |
| B | | | | |
| C | | | | |

La custodia y la conectividad responden preguntas diferentes. En el caso C sabemos quién controla la firma, pero el enunciado no dice cómo guarda internamente las claves el proveedor. Registrá ese dato como no especificado.

## 2. Leer el archivo de práctica

Abrí [datos/transaccion-ejemplo.json](../../laboratorio/datos/transaccion-ejemplo.json). Desde la carpeta `laboratorio`, la ruta es `datos/transaccion-ejemplo.json`. El contenido es un **recibo ficticio** con datos consistentes para practicar. Su campo `hash` es un marcador; no se busca en un explorador.

Prepará una ficha que responda:

1. ¿Qué indican `chainId`, `from` y `to`? ¿En qué red ocurre el ejemplo?
2. ¿Cuál es el valor transferido (`valueETH` y `valueWei`)? ¿Qué indica `status: 1`?
3. ¿Cuánto vale `gasUsed × effectiveGasPriceGwei` en gwei y en ETH? Usá `1 gwei = 10⁻⁹ ETH`.
4. ¿Cuánto recibe el destinatario y cuánto gasta en total el emisor? Mantené separados el valor transferido y la comisión.
5. Si una wallet hubiera cancelado la firma antes del envío, ¿habría un receipt para esa solicitud?

Para interpretar el resultado, consultá la explicación de [receipt y comisión](https://grupo-gemis.github.io/blockchain-curso-2026/encuentro-02.html#lectura-02-recibo). Como extensión, podés elegir una transacción pública de Sepolia y registrar su URL, red y fecha de consulta. Esa operación es distinta del archivo de práctica.

## Evidencia y comprobación

Entregá la tabla de tres casos y la ficha del recibo con la cuenta completa. La ficha debe identificar la red local `31337`, separar el valor de la comisión y explicar por qué obtener un hash al enviar todavía no garantiza éxito. No adjuntes claves privadas ni recovery phrases.

## Extensión

Para una organización con dos responsables, describí quién propone una operación, quién la aprueba y qué procedimiento seguirían si uno pierde su dispositivo. Evaluá si un esquema de firmas múltiples ayuda con ese proceso.
