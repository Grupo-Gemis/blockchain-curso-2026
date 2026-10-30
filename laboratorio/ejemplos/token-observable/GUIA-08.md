# Tutorial completo de la unidad 08

El objetivo es seguir una operación desde la cuenta que la autoriza hasta el recibo y el estado que produjo. El contrato registra AULA. La red local registra además ETH ficticio para pagar gas. Se observan por separado.

## 1. Preparar la carpeta

Descargá o actualizá tu repositorio del curso. Abrí la carpeta `laboratorio/ejemplos/token-observable` en VS Code y una terminal dentro de ella. No se ejecutan los comandos desde `laboratorios/unidad-08`, que contiene la consigna.

Comprobá Node:

```sh
node --version
```

Usá Node.js 24 LTS. Si ya tenés nvm, `nvm install 24` y `nvm use 24` permiten seleccionarlo. El lanzador también busca una instalación 24 existente de nvm si la terminal abre una versión anterior. Si no la encuentra, explica el requisito y se detiene.

```sh
npm run preparar
```

La preparación instala lo fijado en `package-lock.json`, compila TokenAula y ejecuta nueve pruebas sobre un nodo temporal. Su resultado debe mostrar nueve casos aprobados. No crea todavía la instancia con la que vas a trabajar en la página.

## 2. Iniciar el nodo y la interfaz

```sh
npm start
```

La terminal debe informar **http://127.0.0.1:4388**. Dejala abierta y abrí esa dirección en el navegador. El proceso Hardhat mantiene la cadena en memoria en el puerto 19685. El otro proceso entrega los archivos de la interfaz en 4388.

Si un puerto ya está ocupado, el arranque se detiene y conserva el servicio que encontró. No hay que terminar procesos ajenos. Si es una instancia previa de esta práctica, usá su página o detené su terminal con Ctrl+C antes de iniciar otra.

No se conecta MetaMask ni se importa una clave privada. Las cuentas de desarrollo pertenecen al nodo local. No se usan sus claves en redes públicas ni se les envían fondos reales.

## 3. Conectar y crear TokenAula

Dejá **Actuar como: Ana** y pulsá **Conectar**. Se comprueba que el nodo sea el Hardhat local de la práctica y responda con `chainId 31337`. Todavía no se envía una creación por conectar.

Elegí **Receptor de la emisión: Ana** y pulsá **Crear TokenAula**. La página informa primero el hash enviado y después el resultado de su recibo. Deben aparecer:

- Ana: 1.000.000 AULA.
- Bruno y Carla: 0 AULA.
- Oferta total: 1.000.000 AULA.
- Permiso de Ana para Bruno: 0 AULA.
- Dirección de la instancia y bloque consultado.

Ana pagó la creación con ETH ficticio. La cantidad mínima de oferta es `1000000000000000000000000`, equivalente a un millón multiplicado por 10 elevado a 18. El código del constructor no reparte porcentajes. Emite todo al receptor elegido.

El receptor y quien crea pueden ser distintos. Después del recorrido principal podés crear otra instancia actuando como Bruno y eligiendo Ana como receptora. Bruno paga la creación y Ana recibe la oferta. Ninguno recibe un poder de administrador por ese hecho.

## 4. Transferir diez AULA

Actuando como Ana, dejá **Destino de transfer: Bruno** y cantidad `10`. Antes de pulsar, predecí los saldos, la oferta y quién pagará gas. Pulsá **Transferir AULA** y comprobá:

| Cuenta o dato | Resultado |
|---|---:|
| Ana | 999.990 AULA |
| Bruno | 10 AULA |
| Carla | 0 AULA |
| Oferta | 1.000.000 AULA |
| Permiso Ana → Bruno | 0 AULA |

La transferencia no requiere una aprobación previa de Ana para gastar su propio saldo. La transacción se dirige a TokenAula, con Bruno como argumento y `value` nativo cero. La comisión de esa operación se descuenta a Ana en ETH.

## 5. Autorizar tres sin transferirlos

Ana elige **Persona autorizada: Bruno**, cantidad `3`, y pulsa **Aprobar permiso**. Los saldos AULA de la tabla anterior no cambian. El permiso de Ana para Bruno pasa a 3. Ana paga esta aprobación como otra transacción.

Approve fija un valor. Si Ana aprueba 3 y después aprueba 2, el permiso queda en 2. No suma 5. El recorrido principal conserva 3 para el siguiente paso.

## 6. Usar dos desde Ana hacia Carla

Cambiá **Actuar como: Bruno**. En el panel transferFrom, elegí origen Ana, destino Carla y cantidad `2`. Pulsá **Ejecutar transferFrom**.

| Cuenta o dato | Resultado |
|---|---:|
| Ana | 999.988 AULA |
| Bruno | 10 AULA |
| Carla | 2 AULA |
| Oferta | 1.000.000 AULA |
| Permiso Ana → Bruno | 1 AULA |

El llamador y spender es Bruno. Los tokens salen de Ana y los recibe Carla. Bruno paga el gas. El contrato exige saldo del origen y permiso suficiente para el llamador. Autorizar a Carla no habría habilitado a Bruno.

En **Última observación completa**, el evento Transfer muestra Ana como origen y Carla como destino. La cuenta que pagó aparece en `from` del recibo. OpenZeppelin 5.4.0 puede reducir el permiso en esta operación sin emitir otro Approval. El dato actual se comprueba consultando allowance.

## 7. Comparar dos rechazos

Dejá Bruno, origen Ana, destino Carla y cantidad 2. Queda permiso 1.

Primero pulsá **Simular sin enviar**. La estimación debe rechazar por permiso insuficiente. El registro no tiene hash ni recibo de transacción. No cobra gas ni consume nonce por esa consulta. No mueve AULA.

Después pulsá **Enviar con límite explícito**. Este botón omite la estimación y envía la llamada con un límite de gas al nodo de desarrollo. El contrato revierte al ejecutarla. Se observa un hash y un recibo con `status 0`:

- Ana, Bruno y Carla conservan sus saldos AULA.
- La oferta permanece en un millón y el permiso sigue en 1.
- No quedan eventos de éxito de la ejecución revertida.
- Bruno paga el gas utilizado y consume su siguiente nonce.

La diferencia no consiste en que una reversión incluida haya movido parte de los tokens. El estado del contrato se conserva, mientras la red registra la inclusión, el cobro y el nonce del emisor.

## 8. Revocar lo que queda

Volvé a **Actuar como: Ana**, dejá a Bruno como persona autorizada y pulsá **Revocar a cero**. El permiso queda en cero. Los 2 AULA que Carla ya recibió no vuelven por revocar.

Si ahora Bruno intenta simular otro gasto desde Ana, se rechaza. No hay una fecha de vencimiento automática en este permiso de ERC-20. Una aprobación máxima tiene además un tratamiento específico en OpenZeppelin y no disminuye al usarla. Para el recorrido se trabaja con cantidades finitas.

## 9. Leer la comisión y el estado del mismo bloque

Cada observación incluida conserva `gasUsed`, `gasPriceWei`, `feeWei`, `burnedWei`, `tipWei`, bloque, hash y estados antes y después. Los valores enteros se guardan como texto para mantener precisión.

La cuenta es:

```text
comisión en wei = gasUsed × gasPriceWei
base quemada en wei = gasUsed × baseFeeWei
propina en wei = comisión − base quemada
```

Se divide por 10 elevado a 18 para expresarlo en ETH. Se usan los datos del recibo, no un precio inventado ni el límite de gas autorizado. El gas de transfer, approve y transferFrom puede ser diferente porque hacen trabajos distintos.

Los balances, permisos y oferta de una observación se consultan con un número de bloque concreto. Eso evita mezclar lecturas de alturas diferentes. Un evento y un recibo son evidencia de esa ejecución. La comparación de saldos se realiza en la misma red y dirección.

## 10. Exportar y repetir

Pulsá **Exportar observaciones** y guardá el JSON como anexo del trabajo. El archivo no incluye claves privadas. Sí incluye direcciones de desarrollo, cliente, red, génesis, instancia, operaciones, recibos, eventos y estados.

Si recargás la página, las observaciones de esa pestaña se pierden. Guardalas antes. Para seguir consultando el token en el mismo nodo, conectá y abrí la dirección completa de la instancia mediante **Abrir una instancia de este mismo ensayo**.

Ctrl+C en la terminal detiene los dos servicios. Reiniciar el nodo crea otra sesión sin el estado anterior. Creá entonces una instancia nueva. Repetir una dirección de contrato no recupera los balances de una sesión anterior. Conservá evidencia identificada de ambos ensayos.

Para ejecutar el mismo recorrido por terminal, mantené los servicios activos y ejecutá en una segunda terminal de esta carpeta:

```sh
npm run recorrido
```

El script crea otra instancia y guarda `resultados/token-observable.json`. No altera el token que ya tenías abierto en la página.

## 11. Del prototipo al white paper

Completá [white-paper.md](white-paper.md) en dos a cuatro páginas y agregá el JSON como anexo. Definí problema, usuarios, necesidad de una cadena, arquitectura, utilidad, oferta, reparto, autoridades, riesgos y evidencia.

Para el caso base, la tabla propone 50% incentivos de uso, 20% comunidad, 20% reserva y 10% equipo. Son 500.000, 200.000, 200.000 y 100.000 AULA. El constructor no ejecuta esa distribución y no implementa vesting. Un servicio de talleres tampoco queda implementado por transferir tokens.

Cada afirmación se marca como **implementada**, **propuesta** o **dependiente de un actor externo**. Cada una debe tener evidencia o una comprobación pendiente. No se reemplazan los puntos pendientes por una promesa de seguridad, rentabilidad o descentralización.

Intercambiá el documento con otro compañero. Registrá dos observaciones: una afirmación que necesite un mecanismo o evidencia adicional y una condición de fallo que falte analizar. Incluí el cambio que decidiste hacer o la razón concreta para conservar lo escrito.

## Comprobaciones antes de cerrar

- Puedo identificar red, instancia y las tres cuentas.
- Distingo dirección del token, origen de tokens, destino y llamador.
- Puedo explicar por qué aprobar no mueve AULA y por qué no cambia totalSupply.
- Comprobé el permiso finito después del gasto y después de revocar.
- Comparé rechazo al estimar con reversión incluida, gas y nonce.
- Puedo señalar qué promesas del documento siguen sin implementarse.

Las nueve pruebas verifican comportamientos del contrato y las herramientas. La revisión docente evalúa el documento, las predicciones y la interpretación de evidencia. Los tests no califican automáticamente el white paper ni envían una nota al aula virtual.
