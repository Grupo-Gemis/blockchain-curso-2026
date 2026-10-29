# Red de aula para distintos cursos

**Para operar clientes reales desde casa**, sigan [la red privada con Besu y Docker](real-besu/README.md). Cada computadora conserva su cadena y participa del consenso QBFT. La preparación está disponible y la ejecución entre casas está pendiente de comprobación. También se puede conectar la simulación mediante [la guía de Internet](DESDE-CASA.md).

Hay tres modalidades: **simulación con coordinador**, **simulación de nodos independientes en la red local** y **red de clientes reales desde casa o en el laboratorio**. Las dos simulaciones permiten realizar a mano los pasos del consenso. En Besu los clientes cumplen esos deberes automáticamente. El [tutorial de nodos didácticos independientes](NODOS-INDEPENDIENTES.md) mantiene un programa Node.js por computadora y comunicación directa.

La guía [cómo incorporarse a una red pública](NODO-PUBLICO.md) explica las diferencias entre verificar como nodo, activar un validador en Hoodi y participar del grupo autorizado de nuestra red privada.

La modalidad coordinada que sigue permite comenzar con menos preparación. Cada estudiante participa como un nodo didáctico. Tiene una identidad de firma, conserva una copia de la cadena y comprueba las propuestas. La cantidad se configura entre 2 y 60. En N turnos todos pasan una vez por el rol de proponente. El valor inicial es diez. El docente coordina los tiempos y observa sin ocupar una identidad de estudiante.

La actividad conecta las unidades 01, 06 y 07. Permite experimentar difusión, puja, capacidad, nonces, propuesta, comprobación, atestaciones, quórum y finalidad. No requiere wallet, saldo público ni instalar dependencias. El código está completo.

## Preparar la sesión

**En la modalidad coordinada**, solo la computadora que distribuye los mensajes necesita **Node.js 24 LTS**. Los estudiantes necesitan un navegador y acceso a esa computadora por la misma red local. Su caída interrumpe esta modalidad. **En la modalidad entre pares, cada estudiante necesita Node.js 24 y ejecuta su propio nodo.** La biblioteca de firmas se sirve desde esta carpeta y no se descarga de Internet.

Desde la raíz del repositorio:

```sh
cd laboratorio/ejemplos/red-aula
npm test
npm run aula
```

La terminal muestra un código de seis cifras, el acceso docente y las direcciones para estudiantes. El docente abre su acceso y comparte con el grupo una dirección de la forma `http://192.168.1.20:4780`, usando la dirección real que informó el programa. **127.0.0.1 siempre indica la propia computadora**. No sirve para que otro estudiante se conecte a la del docente.

Para otro tamaño de curso, indiquen la cantidad al arrancar:

```sh
npm run aula -- --estudiantes 20
```

También se puede usar **Cantidad de estudiantes → Aplicar cantidad** en el panel docente, antes del primer ingreso. La cantidad queda fija cuando ingresa alguien. Para otra cursada se inicia otra sesión y se conserva la evidencia previa. Los selectores, saldos iniciales, turnos, quórum y exportación se adaptan automáticamente. El límite de tres transferencias por bloque se mantiene para observar la competencia por espacio.

El quórum es `floor(2 × N / 3) + 1`, estrictamente mayor que dos tercios. Con 6 se necesitan 5 firmas, con 10 se necesitan 7 y con 20 se necesitan 14. Las ausencias toleradas para reunir ese quórum son N menos esa cantidad. La admisión hasta 60 no representa una medición de rendimiento con 60 computadoras.

Cada estudiante elige el número de nodo asignado, escribe su nombre y el código. El navegador genera una clave exclusiva de esta simulación. Mantener la pestaña abierta permite conservar la identidad durante la sesión. El docente inicia cuando aparecen todas las identidades configuradas.

Para ensayar en una sola computadora:

```sh
npm start
```

Abrí diez pestañas de estudiante, cada una ingresando con un número diferente, y otra con el acceso docente. Cada pestaña conserva su identidad y su réplica en su propia sesión. El puerto es 4780 y no se superpone con el Contador. Otro puerto se elige con `npm run aula -- --puerto 4781`.

## Antes de firmar

Una **transacción** pide un cambio de estado. Una **propuesta** contiene un bloque candidato con operaciones ordenadas y una huella del estado que deberían producir. Una **atestación** es el voto firmado de un participante sobre esa propuesta. La firma de una propuesta no reemplaza los votos de los demás.

El **nonce** es el número de secuencia de la cuenta. El **gas** mide trabajo. La **tarifa base** se quema y la **propina efectiva** se acredita al receptor de comisiones del bloque. El máximo total por gas incluye ambas partes. En esta práctica se usa el proponente como receptor de las propinas.

Cada identidad empieza con 1 ETH ficticio. Cada transferencia simple consume y autoriza 21.000 gas. El bloque tiene un límite didáctico de 63.000 gas y caben hasta tres transferencias. La base inicial es 20 gwei por gas. Un bloque lleno eleva la base siguiente a 22,5. Un bloque vacío la baja 12,5%, con las divisiones enteras de EIP-1559. La condición inicial se configura en el génesis.

## Guion de participación con el ejemplo de diez

El siguiente guion conserva la clase de diez como ejemplo. Para otro N, usen su quórum Q, comparen Q − 1 con Q votos y desconecten N − Q y luego N − Q + 1 participantes. Completen N turnos para que todos propongan. La postergación de una oferta baja se observa después de `floor((N − 1) / 3)` bloques llenos, si N es al menos 4 y hay una operación de mayor propina por cada otra cuenta. Con grupos menores se envían varias operaciones consecutivas por cuenta para llenar la cola.

Se puede realizar en 70 a 90 minutos. Los tiempos son una propuesta de clase y pueden extenderse. El docente no avanza el turno hasta que el grupo haya explicado la observación.

| Etapa | Qué hacen los diez participantes | Qué se observa |
|---|---|---|
| 1. Identidad y génesis | Cada estudiante ingresa con su número y compara su huella de génesis con otro nodo. | Diez identidades diferentes comparten el mismo estado inicial. |
| 2. Difusión y puja | Todos envían una transferencia a la identidad siguiente. Nodo 1 ofrece propina máxima 0,1 y los demás 3 gwei por gas, con máximo total 100. | Hay diez operaciones para tres lugares. Se compara la propina efectiva, no solo el máximo total. |
| 3. Primera propuesta | El nodo asignado usa **Elegir por propina efectiva**, revisa el orden y firma la propuesta. Los demás usan **Comprobar propuesta en mi nodo**. | El proponente arma el bloque y cada validador vuelve a ejecutar sobre su propia copia. |
| 4. Seis y siete votos | Seis personas firman aprobación y se detienen. Una séptima firma después. | Con seis firmas no hay bloque certificado. La séptima completa el quórum. Una identidad no cuenta dos veces. |
| 5. Copias y costos | Todos comparan la huella, sus saldos, los nonces y la quema. Se certifica otro bloque válido en el turno siguiente. | Los nodos reconstruyen el mismo estado. Las propinas cambian de cuenta y la base reduce la oferta. El primer bloque pasa a finalidad simplificada. |
| 6. Postergación | Se completa un tercer bloque con las ofertas superiores que siguen pendientes. | La operación de Nodo 1 con propina 0,1 sigue esperando después de nueve operaciones más atractivas. No consumió su nonce. |
| 7. Propuesta inválida | El nuevo proponente activa **Experimento: proponer un estado alterado**. Los nodos comprueban y firman rechazo. | Una firma correcta del proponente no vuelve correcto el estado. No cambian la cadena, los saldos ni los nonces. |
| 8. Ausencias | En otro turno tres estudiantes usan **Desconectar mi nodo**. Los siete restantes certifican una propuesta válida. En un turno posterior se desconectan cuatro y los seis restantes votan. | Tres ausencias permiten reunir siete votos. Cuatro impiden certificar. El docente puede avanzar el turno, pero no convertir seis votos en siete. |
| 9. Recuperación | Los participantes desconectados vuelven con **Reconectar y verificar la cadena**. | Cada navegador comprueba los certificados y reconstruye los bloques que le faltaban antes de aceptar el estado. |
| 10. Rotación y cierre | Se continúa hasta completar diez turnos, incluyendo vacíos si hace falta. Cada estudiante guarda evidencia y explica qué hizo cuando le tocó proponer. | Todos experimentan propuesta y validación. Diez turnos no implican diez bloques si hubo propuestas rechazadas o sin quórum. |

El orden de proponentes se obtiene de una semilla compartida y se comprueba en cada navegador. Cada ciclo de diez turnos usa las diez identidades una sola vez. No se promete que Ethereum distribuya sus turnos de esta manera. Después de la séptima aprobación, las tres identidades restantes pueden comprobar y atestiguar mientras el docente no avance el turno. Esas firmas amplían el certificado sin ejecutar de nuevo el bloque ni cobrar otra comisión.

## Experimentos adicionales

### El máximo más alto no compra la mayor prioridad

Antes del primer bloque, configurá ofertas de 100/1, 22/5, 30/3, 19/2 y 21/4, donde cada par expresa máximo total y propina máxima en gwei por gas. Con base 20, las propinas efectivas son 1, 2, 3, no admisible y 1. El criterio codicioso selecciona la tercera, la segunda y la primera. El empate usa el orden de llegada al coordinador.

```sh
npm run puja
```

La terminal muestra la misma cuenta sin necesitar varios navegadores. No es una transacción en Ethereum.

### Un nonce posterior ofrece más y sigue esperando

Un participante envía su nonce 0 con propina 1 y luego su nonce 1 con propina 9. El segundo no puede adelantarse al primero. Para reemplazar el pendiente se escribe su mismo nonce y se elevan ambos topes al menos 10%. Esa es la política de admisión de este laboratorio, no una regla universal del consenso de Ethereum.

### Elegir una operación menos rentable

El proponente puede seleccionar manualmente una transacción válida con menor propina. Si el bloque respeta todas las reglas, los nodos pueden aprobarlo. La comparación explica por qué **validez** y **preferencia económica** son conceptos distintos. No existe una regla del aula que obligue a elegir siempre el resultado del botón de sugerencia.

## Qué comprueba cada navegador

Al recibir la cadena, el navegador parte de los saldos y las identidades del génesis. Verifica la firma de cada transacción, la identidad asignada para proponer, el enlace al padre, el hash, la base calculada, los límites, los nonces y los fondos. Ejecuta las transferencias y compara la huella del estado. Comprueba que el certificado alcance el quórum configurado con firmas distintas sobre el mismo bloque.

La aprobación de una propuesta requiere pulsar primero la comprobación local. El coordinador verifica además las reglas y los votos antes de certificar. Una propuesta inválida se puede difundir para el experimento, pero no certificar. La huella del estado usa SHA-256. Las firmas usan las herramientas de ethers 6.16.0 con secp256k1 y mensajes identificados por hash.

## Qué simplificamos

| Regla de aula | Relación con una red real |
|---|---|
| En esta modalidad un coordinador distribuye mensajes y avanza turnos. | Ethereum usa conexiones entre pares. La modalidad de [nodos independientes](NODOS-INDEPENDIENTES.md) elimina esa dependencia y usa su propio consenso didáctico. |
| N navegadores representan nodos y todos pueden votar sobre cada propuesta. | Un cliente completo conserva y verifica datos con reglas de ejecución y consenso. Ethereum asigna deberes a comités. |
| Todos tienen igual peso y se turnan sin repeticiones en cada ciclo. | En PoS importan el saldo efectivo y la asignación del protocolo. Puede repetirse un proponente. |
| El docente avanza los turnos. | Ethereum tiene slots y épocas temporizados por el protocolo. |
| El quórum configurado certifica y un sucesor certificado finaliza al anterior. | Ethereum justifica y finaliza checkpoints de épocas mediante reglas adicionales. |
| Solo hay transferencias de costo fijo en el modelo clásico de gas. | Los contratos y las reglas activas generan costos y límites diferentes. |
| La tarifa base se quema y no hay emisión. | Ethereum emite recompensas de consenso y aplica penalizaciones con reglas separadas. |

Las claves se crean solo para esta actividad. No se introduce una frase de wallet ni se importa una cuenta pública. Las operaciones firmadas aquí no son transacciones aceptadas por Ethereum. Operar sobre el mismo contrato de Sepolia continúa en [la práctica del Contador](../testnet-observable/README.md). La posibilidad de ejecutar nodos reales se explica en [el apunte de la unidad 07](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-07.html#lectura-07-redes).

## Evidencia y final de la sesión

Cada participante pulsa **Guardar evidencia pública**. El archivo contiene cadena, certificados, operaciones, votos, turnos y la huella de su réplica. No contiene su clave privada ni los accesos de la sesión. El coordinador conserva un archivo por sesión en `resultados/`. Iniciar otra sesión crea otro archivo y otro código. Ctrl+C termina la sesión en curso.

En el informe, cada estudiante identifica una propuesta propia, una comprobación, el resultado con seis y siete votos y el efecto de una propuesta inválida. Agrega una cuenta de comisión y quema y una comparación entre estar desconectado, rechazar y no alcanzar quórum. Explica por qué la postergación observada no demuestra una garantía de inclusión futura.

## Si otras computadoras no llegan al aula

Para estudiantes en casas distintas, usen la [guía por Internet](DESDE-CASA.md). La red física compartida no es un requisito si ya se configuró esa red virtual. Para la modalidad coordinada por VPN, la regla de acceso debe incluir TCP 4780 y los navegadores usan la dirección virtual del coordinador.

Para una sesión presencial, comprobá que se inició `npm run aula`, que todas usan la dirección de la computadora coordinadora y el puerto correcto y que están en la misma red. Algunas redes de invitados impiden la comunicación entre dispositivos. En ese caso, usen una red local que permita comunicar las computadoras o ensayen con pestañas independientes en la máquina docente. Cada navegador debe poder abrir la dirección antes de ingresar.

No hace falta Docker, sincronizar Sepolia ni configurar una extensión para este ejercicio. El enlace docente permite avanzar los turnos y se conserva en la computadora del docente. Compartí con los estudiantes la dirección sin ese acceso.

## Fuentes

- [EIP-1559 y reglas de comisiones](https://eips.ethereum.org/EIPS/eip-1559).
- [Ethereum sobre nodos y clientes](https://ethereum.org/developers/docs/nodes-and-clients/).
- [Ethereum sobre prueba de participación](https://ethereum.org/developers/docs/consensus-mechanisms/pos/).
- [Ethereum sobre atestaciones](https://ethereum.org/developers/docs/consensus-mechanisms/pos/attestations/).
- [Testnets y participación en Sepolia y Hoodi](https://ethereum.org/developers/docs/networks/).

La biblioteca incluida conserva su [licencia MIT](vendor/ethers-LICENSE.md).
