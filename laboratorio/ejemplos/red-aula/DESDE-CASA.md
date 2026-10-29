# Cada estudiante desde su casa: conectar los nodos por Internet

Esta guía conecta **la simulación entre pares**. Para ejecutar clientes de blockchain reales, seguir [Besu con Docker](real-besu/README.md). Se puede usar la misma VPN, con los puertos P2P que indica ese tutorial. Docker es necesario en la modalidad Besu.

No necesitan estar en el mismo Wi-Fi. Cada estudiante ejecuta su nodo en su computadora y los conectamos mediante una **red privada virtual entre pares**, o VPN. La VPN proporciona direcciones que se pueden alcanzar desde las otras casas y protege el transporte. El programa de blockchain sigue comprobando firmas y reglas en cada equipo.

Para esta cursada se propone **NetBird**, con una red de laboratorio administrada por el docente y un equipo por estudiante. La alternativa de la misma red local sigue disponible en [el tutorial general](NODOS-INDEPENDIENTES.md). Los pasos de consenso, puja, quórum y recuperación son los mismos.

## Cómo queda el grupo de diez

| Participante | Qué ejecuta | Qué conserva y decide |
|---|---|---|
| Estudiante 1, desde su casa | Node.js 24, su nodo y el cliente VPN | Clave propia, historial propio y decisiones firmadas. |
| Estudiantes 2 a 10, desde otras casas | Cada uno ejecuta lo mismo en su computadora | Cada nodo verifica y se comunica con sus compañeros. |
| Docente | Administra las altas de la VPN y puede observar desde el navegador | No ocupa una identidad de consenso si solo observa. |

Son **diez nodos de blockchain y un quórum de siete**. Si el docente conecta además su computadora a la VPN para observar, hay once equipos en la VPN, pero siguen siendo diez validadores en el archivo `red.json`. El docente puede abrir la dirección de un estudiante sin su acceso de control para ver los datos públicos. No necesita ejecutar un undécimo nodo.

## Cuentas, equipos y planes

La propuesta usa **una cuenta docente de administración**, sin compartir su contraseña. Cada computadora se incorpora con una clave de alta individual de un solo uso. Después, cada estudiante genera por separado su identidad de firma en la blockchain. La clave de alta de la VPN y la clave de firma del nodo cumplen funciones diferentes.

Al 29/10/2026, NetBird Cloud publica un plan gratuito de hasta **5 cuentas de usuario y 100 equipos**. El alta de máquinas mediante claves de configuración está documentada y no requiere un inicio de sesión interactivo de cada máquina. Esta propuesta inscribe los equipos del laboratorio de esa forma. No supone que el plan permita once cuentas personales de NetBird. Si se necesitan diez estudiantes con cuentas propias y acceso individual a su panel, hay que elegir un plan que admita esa cantidad. Fuentes: [planes vigentes](https://netbird.io/pricing) y [alta de máquinas con claves](https://docs.netbird.io/manage/peers/register-machines-using-setup-keys).

Para otros cursos, cuenten todos los equipos que se van a conectar y revisen las condiciones del proveedor. El límite del programa de blockchain sigue siendo de 2 a 60 nodos. No depende del número de cuentas administrativas de la VPN. Tailscale y ZeroTier también pueden brindar conectividad, pero sus planes gratuitos actuales tienen límites diferentes: Tailscale admite hasta seis usuarios y ZeroTier Personal hasta diez dispositivos y una red, con uso personal no comercial. No se debe dar por hecho que cualquiera de esos planes cubre diez estudiantes y un equipo docente. Fuentes: [Tailscale](https://tailscale.com/pricing) y [ZeroTier](https://www.zerotier.com/pricing/).

## 1. Preparación del docente

1. Crear o usar un espacio de NetBird dedicado a esta práctica. El [inicio oficial](https://docs.netbird.io/get-started) explica la cuenta y el cliente. La red de laboratorio debe permitir comunicar los equipos entre sí.
2. Crear un grupo llamado `Blockchain-aula`. Incluir allí los diez equipos de estudiantes y, si corresponde, el equipo docente de observación.
3. Permitir conexiones TCP al puerto **4781**, desde ese grupo hacia el mismo grupo, en ambos sentidos. No hace falta publicar el puerto en los routers de las casas ni configurar una salida de toda la navegación a través del docente.
4. Revisar las otras políticas del espacio. En un espacio nuevo que solo se dedica al laboratorio, sustituir la política inicial de acceso general por la regla del curso cuando esta funcione. No modificar políticas de otras redes de trabajo. Ver [grupos y permisos de NetBird](https://docs.netbird.io/manage/access-control/manage-network-access).
5. En la sección de claves de configuración del panel, crear **una clave de un solo uso por computadora**, con vencimiento y asignación al grupo del curso. Entregar cada una a su destinatario por un medio privado. No ponerlas en el repositorio ni en el chat público de la clase.

El docente conserva una lista que relaciona número de estudiante, nombre del equipo en la VPN y dirección asignada. Autorizar el acceso a la VPN no autoriza al docente a firmar por un estudiante. La identidad de firma se crea después en la computadora de ese estudiante.

## 2. Conectar mi computadora a la VPN del curso

Cada estudiante instala el cliente de NetBird para su sistema desde la [documentación oficial de instalación](https://docs.netbird.io/get-started/install). Necesita permisos para instalar el adaptador de red. No es necesario instalar Docker.

Para incorporarse con la clave individual que entrega el docente, el comando es:

```sh
netbird up --setup-key CLAVE_INDIVIDUAL_ENTREGADA_POR_EL_DOCENTE
```

Se reemplaza ese texto por la clave real en la terminal propia. No se copia el comando con la clave real a capturas o evidencias. Si el cliente requiere privilegios, se ejecuta desde una terminal con permisos de administrador en Windows o con los permisos que indique el instalador para macOS o Linux.

Esperar que el cliente indique que está conectado y anotar su **dirección de NetBird**. Se puede consultar en la aplicación o con:

```sh
netbird status
```

No usar la dirección del Wi-Fi doméstico, como `192.168.1.20`, ni la dirección pública del router. La dirección virtual suele ser `100.x.x.x`. En los ejemplos siguientes, **100.80.1.11 y 100.80.1.12 son ficticias**. Deben sustituirse por las que muestra cada cliente.

## 3. Arrancar cada nodo con su dirección virtual

Desde `laboratorio/ejemplos/red-aula`, Ana usa su número y la dirección de su VPN:

```sh
npm run nodo -- --id 1 --nombre "Ana" --anunciar http://100.80.1.11:4781 --datos datos-nodo-1-casa --espera-ms 15000
```

Bruno, desde otra casa, usa la suya:

```sh
npm run nodo -- --id 2 --nombre "Bruno" --anunciar http://100.80.1.12:4781 --datos datos-nodo-2-casa --espera-ms 15000
```

Los demás hacen lo mismo con los números 3 a 10. Todos pueden usar el puerto 4781 porque son equipos diferentes. La opción `--anunciar` identifica la dirección a la que se conectan los compañeros. El programa no puede adivinar si debe anunciar Wi-Fi, Ethernet o VPN, por eso se indica explícitamente.

La espera de red inicial es de diez segundos y `--espera-ms 15000` permite hasta quince por intercambio. No modifica las reglas ni el quórum. Es un margen para conexiones domésticas y posibles retransmisiones. Un equipo con problemas puede tardar en aparecer como desconectado.

Cada estudiante abre **Mi control local**, el enlace que muestra su propia terminal con dirección `127.0.0.1`. Ese enlace controla solo su nodo y no se comparte. Para llegar al nodo de otro estudiante se usa su dirección virtual. Se mantienen abiertos el cliente VPN y el programa del nodo durante la práctica.

Si ya se había ensayado con una dirección de red local, conservar esa carpeta y usar la nueva carpeta `datos-nodo-1-casa`. Una dirección anunciada forma parte de la invitación firmada. No se modifica a mano una invitación ni el archivo común de una sesión anterior.

## 4. Compartir invitaciones y acordar la red

Se sigue el [tutorial de nodos independientes](NODOS-INDEPENDIENTES.md): cada estudiante comparte su invitación pública firmada. Las invitaciones deben contener las **direcciones virtuales**, no las domésticas. El docente u otra persona reúne las diez y crea una sola vez `red.json` desde el panel del programa.

Todos descargan el mismo archivo, guardan una copia en la carpeta de la práctica y lo cargan en su nodo. Comparan la huella del archivo común y del génesis. Crear otro archivo por separado puede formar otra red aunque tenga los mismos nombres.

El administrador de la VPN y la persona que reúne las invitaciones pueden ser el docente. Ninguno de esos roles cuenta como un voto adicional ni permite cambiar el resultado de una ejecución.

## 5. Comprobar desde cada casa antes de comenzar

Con los nodos encendidos y el archivo común cargado, **cada estudiante** ejecuta:

```sh
npm run diagnostico -- --red red.json --espera-ms 15000
```

La comprobación consulta las direcciones, verifica que responde la identidad esperada y comprueba el historial y las firmas. También compara el último bloque y el turno. Solo consulta información pública. No firma, envía operaciones ni cambia la configuración.

El resultado debe indicar que todos responden con las mismas identidades, historial y último bloque. Hacerlo desde una sola casa no prueba las conexiones del resto. Que el docente pueda abrir diez direcciones tampoco demuestra que los diez estudiantes se comuniquen entre sí.

| Resultado | Qué revisar |
|---|---|
| Sin respuesta | VPN conectada, programa abierto, dirección virtual correcta, permiso TCP 4781 y firewall del sistema. |
| Otra red | Ese nodo debe cargar el mismo `red.json`. |
| Otra identidad | La dirección anunciada responde con otro número o con otra carpeta de datos. |
| Historial inválido | Detener los votos y comparar la evidencia. No aceptar un estado sin verificar. |
| Historias válidas todavía distintas | Esperar la difusión y repetir sin proponer nuevos bloques mientras se compara. |

Permitir el programa del nodo en el firewall del sistema si este lo requiere. La regla debe dar acceso desde la red privada del curso al puerto del ejercicio. No hace falta desactivar el firewall completo.

## 6. Realizar la práctica y observar una caída

Los diez firman operaciones, comparan propinas, proponen por turnos y comprueban. Con seis aprobaciones no se certifica. Con siete, sí. Se puede mantener una videollamada para explicar las observaciones y compartir pantallas. Esa videollamada no transporta los mensajes del consenso.

Apagar el programa de un estudiante debe permitir continuar a los otros nueve si reúnen siete decisiones. Si el ausente era el proponente, siete pueden firmar pasar el turno. Apagar la computadora docente de observación no cambia el quórum porque no es una de las diez identidades.

Al volver, cada estudiante arranca su mismo comando y carpeta. Su nodo reconstruye el historial que falta desde los pares. No se borra la identidad ni se liberan decisiones ya firmadas. Los experimentos de propuestas inválidas, falta de quórum y recuperación siguen el guion general.

## Qué descentralizamos y de qué dependemos

Los diez programas conservan sus copias, eligen qué firmar y comprueban las reglas. La VPN aporta transporte y administración de acceso. Sus servidores no tienen las claves de firma de los nodos ni votan por los estudiantes.

NetBird intenta conexiones entre pares. Si los routers impiden el enlace directo, puede usar un retransmisor de tráfico cifrado. El transporte puede depender de servicios externos aunque el consenso y los datos de cada nodo se comprueben de manera independiente. Un fallo de conectividad todavía puede impedir reunir el quórum. No se promete independencia de toda infraestructura de Internet. Ver [cómo funciona NetBird](https://docs.netbird.io/about-netbird/how-netbird-works).

La VPN no convierte el programa en Ethereum real. La red sigue usando miembros conocidos, peso igual y un consenso didáctico. Para operar nodos reales de Ethereum hay que usar los clientes y las reglas de esa red.

## Finalizar la sesión

Guardar la evidencia pública del nodo y detenerlo con Ctrl+C. Desconectar el cliente de la VPN cuando termine la práctica. El docente puede retirar los equipos del laboratorio que ya no deban entrar. Revocar una clave de alta solo impide nuevas altas con esa clave, no desconecta por sí mismo las máquinas que ya la usaron.

**Estado de validación:** el software de nodos se probó previamente con diez procesos independientes en una computadora. El diagnóstico tiene pruebas de respuestas correctas, identidades, red, historial y diferencias de turno. La conexión real por VPN desde las casas de los estudiantes queda pendiente del ensayo previo con sus equipos. No se creó una cuenta de NetBird ni se conectaron las computadoras de los estudiantes desde esta conversación.
