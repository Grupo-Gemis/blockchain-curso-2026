# Cómo participar en una red pública como nodo o validador

**En Ethereum no hace falta postularse ante un administrador para operar un nodo que comprueba la red.** Se instalan clientes, se elige la red, se conectan pares y se sincronizan los datos. Ser aceptado como par no convierte al nodo en validador del consenso.

La diferencia depende de las reglas de cada red:

| Participación | Cómo se ingresa | Qué puede hacer |
|---|---|---|
| Nodo completo de Ethereum público | Ejecutar clientes compatibles y sincronizar. No requiere un depósito de ETH. | Comprobar bloques y estado, propagar operaciones y ofrecer un RPC propio. |
| Validador PoS de Hoodi | Crear claves, hacer el depósito con fondos de prueba y esperar activación del protocolo. | Atestiguar y proponer cuando sea asignado. |
| Validador de Sepolia | Su conjunto está autorizado para las pruebas de la red. | Ejecutar un nodo no da automáticamente un lugar en ese conjunto. |
| Validador de nuestra red privada QBFT | Estar en el génesis inicial o incorporarse mediante las reglas y votos de sus validadores. | Participar de QBFT. No usa el depósito PoS de 32 ETH. |

La selección de testnets se verificó el 29/10/2026 en [la documentación de redes de Ethereum](https://ethereum.org/developers/docs/networks/). Hoodi tiene validadores abiertos. Sepolia es la opción de pruebas de aplicaciones y mantiene validadores autorizados. La disponibilidad de fondos de prueba y los requisitos cambian con el tiempo.

## Primero: operar un nodo completo que verifica

Un nodo de Ethereum PoS reúne dos funciones de software. El **cliente de ejecución**, o EL, ejecuta transacciones y mantiene el estado de cuentas y contratos. El **cliente de consenso**, o CL, sigue la cadena de consenso y su finalidad. Se comunican mediante Engine API, una interfaz autenticada con un secreto JWT compartido localmente. JWT identifica aquí el mecanismo de autenticación entre ambos programas.

El recorrido es:

1. Elegir explícitamente la red. Para aplicaciones, Sepolia. Para aprender validación abierta, Hoodi. La configuración, los datos y los puertos pertenecen a esa red.
2. Consultar las versiones actuales y requisitos de un cliente EL y uno CL compatibles con las actualizaciones activas. Besu es un ejemplo de EL y Lighthouse o Teku son ejemplos de CL. En Ethereum público, Besu solo no reemplaza al cliente de consenso.
3. Preparar almacenamiento persistente, los archivos de red y la autenticación local de Engine API. Conservar las interfaces administrativas en el propio equipo.
4. Iniciar los clientes y permitir sus conexiones P2P. Descubren y comprueban pares mediante los mecanismos de esa red. Los nodos de arranque ayudan a encontrar pares, pero no certifican los bloques por los demás.
5. Esperar la sincronización. Consultar en ambos clientes el progreso, los pares, la cabecera y la finalidad. Comparar identificadores públicos de bloques con otra fuente ayuda al diagnóstico. La validez debe comprobarla el propio software.
6. Usar el RPC propio para consultar saldos o enviar transacciones. Mantener los clientes actualizados, disco disponible y conexión estable.

Operar ese nodo no recibe por sí solo una recompensa de emisión. La autonomía que aporta es verificar y acceder a la red desde software propio, además de contribuir a su comunicación. No equivale a conectar MetaMask a un proveedor ni a ejecutar una cadena Hardhat aislada.

La [guía oficial para poner en marcha un nodo](https://ethereum.org/developers/docs/nodes-and-clients/run-a-node/) describe recursos y sincronización. Los requisitos de la red pública son mayores que los de nuestra cadena pequeña. No debemos prometer que una computadora de 8 GB alcance para sincronizar Hoodi o Mainnet. Antes de planificar una práctica pública se comprueban cliente, estado actual, almacenamiento y conexión disponibles.

## Después: activar un validador PoS en Hoodi

El validador utiliza además software que conserva una clave de firma y cumple deberes asignados por el protocolo. El depósito no compra el derecho a decidir bloques inválidos. Los otros nodos siguen comprobando las mismas reglas.

1. Tener el nodo EL y CL configurado para Hoodi, sincronizado y mantenido.
2. Usar el [Launchpad oficial de Hoodi](https://hoodi.launchpad.ethereum.org/en/) para seguir la preparación de claves y credenciales de retiro. Verificar siempre que se está en Hoodi. Las claves de firma, las de retiro y el archivo público de depósito tienen funciones diferentes.
3. Obtener fondos de **prueba de Hoodi** por los recursos disponibles para esa red. Un faucet distribuye fondos que controla, no representa la emisión automática por participar.
4. Realizar el depósito requerido para activar el validador. El mínimo de activación individual es **32 ETH de la red correspondiente**. En esta práctica serían 32 ETH de prueba de Hoodi. No se compran ni se depositan ETH de Mainnet como parte del curso.
5. Esperar el procesamiento y la cola de activación. El nodo no se vuelve proponente al instante por enviar la operación de depósito.
6. Iniciar el cliente validador con sus claves y la conexión al cliente de consenso. El software atestigua automáticamente y propone cuando el protocolo lo asigna. No hay una votación humana desde el navegador para cada bloque.
7. Observar deberes, inclusión de atestaciones, propuestas, saldo de consenso y posibles penalizaciones. Al retirarse, seguir el proceso de salida y las credenciales configuradas.

La selección de proponente en Ethereum público depende del protocolo y del saldo efectivo. No promete que diez estudiantes reciban un turno cada diez bloques. La finalidad utiliza atestaciones, épocas y checkpoints, distintos de los certificados por bloque de QBFT. El mismo validador no debe firmar simultáneamente desde dos instancias, porque puede producir firmas incompatibles y sufrir slashing, una penalización del consenso.

La explicación del mínimo, los deberes y la preparación se apoya en [staking individual](https://ethereum.org/staking/solo/) y [consenso de prueba de participación](https://ethereum.org/developers/docs/consensus-mechanisms/pos/). El tutorial privado del curso permite aprender operación y fallas con un costo menor. La activación pública se realiza después, cuando se disponga de los recursos y fondos de prueba necesarios.

## Qué significa descentralización en nuestra práctica

Cada computadora verifica con su cliente, guarda sus datos, conserva su clave y puede intercambiar bloques con varios pares. El docente prepara la actividad y puede administrar la VPN. Ese rol no lo convierte en una autoridad que acepte bloques por los estudiantes.

Nuestra red QBFT sigue siendo una red de integrantes conocidos. Usa una misma implementación de cliente, las reglas iniciales acordadas y un servicio de conectividad. Son dependencias que debemos identificar. El propósito del ensayo es observar cómo se distribuyen la verificación y el consenso y qué ocurre cuando fallan participantes o conexiones. Operar diez clientes reales no reproduce por sí solo la apertura, la escala, los incentivos ni la diversidad de Ethereum público.
