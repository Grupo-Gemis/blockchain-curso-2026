# Comprobación antes de usar clientes reales con el curso

La preparación y las pruebas de herramientas no demuestran por sí solas que Besu haya producido bloques ni que diez casas puedan comunicarse. Registrar cada etapa por separado y conservar sus resultados.

## Estado al 29/10/2026

| Etapa | Estado y alcance |
|---|---|
| Generación de invitaciones y archivos para 4, 6, 10, 17 y 60 | Comprobada con firmas reales y archivos temporales. |
| Génesis RLP, privacidad de claves, rechazo de red equivocada y firma de transacciones | Comprobados por pruebas de las herramientas. |
| Esquema Docker Compose | Comprobado para los diez archivos de configuración. No equivale a iniciar diez contenedores. |
| Cuatro clientes Besu, transferencia, quórum y recuperación | APROBADA con Besu 26.10.2 en Linux ARM64 y Docker 29.1.2. Ver [resultado de la ejecución](evidencia/cuatro-clientes.json). |
| Un nodo por computadora de 8 GB | PENDIENTE en cada equipo físico. La muestra del ensayo de cuatro contenedores fue de 699,6 a 717,8 MiB por cliente. No es una prueba de carga de la clase. |
| Diez nodos desde casas diferentes | PENDIENTE de ensayo con la VPN y firewalls reales. |

## Ensayo automatizado con cuatro clientes

En una computadora de prueba con Docker iniciado y recursos para cuatro clientes, desde la carpeta de la práctica:

```sh
npm run real:verificar
```

El programa usa cuatro identidades nuevas, otro chainId y una red Docker propia. No utiliza las claves ni los volúmenes de los estudiantes. Descarga la imagen fija si no está disponible. Requiere el rango Docker `172.29.237.0/24` libre y puertos locales 18545 a 18548.

Comprueba bloques, una transferencia con recibo, continuidad con tres de cuatro validadores, detención con dos, reinicio con los mismos datos e igualdad de bloque y estado entre los cuatro. Guarda evidencia y registros en `resultados/besu-real-...`. Al terminar retira sus contenedores y su red Docker. Conserva las carpetas y los volúmenes para revisar la prueba. Las claves generadas son únicamente del ensayo y no se entregan.

Un resultado verde demuestra esa ejecución de cuatro clientes en un host. No demuestra funcionamiento entre casas ni consumo aceptable en equipos de 8 GB. No sustituir la imagen o los parámetros de consenso después de la comprobación sin repetirla.

## Piloto entre dos casas y luego con el grupo

Para un primer piloto, mantener al menos cuatro validadores. Dos personas pueden operar dos nodos cada una, usando claves, puertos y carpetas diferentes. Es un ensayo de enlaces entre dos casas y no cuatro operadores independientes. El ensayo completo utiliza diez computadoras.

Registrar en cada equipo: sistema, arquitectura, RAM total y asignada a Docker, espacio disponible, versión de Docker, imagen de Besu, VPN, dirección anunciada, pares conectados y consumo durante envío de operaciones. No incluir secretos de la VPN ni claves de la blockchain.

Cada estudiante comprueba el mismo archivo común y génesis. Con todos conectados se revisan los pares de cada nodo. Se envían transferencias desde varias casas, se identifican propuestas de todos y se comparan recibos. Se apaga la computadora que reunió las invitaciones, se prueban tres y cuatro ausencias y se recuperan los nodos con su identidad y volumen originales.

La evidencia final debe incluir un bloque común con el mismo hash y raíz de estado desde diez nodos distintos. Si el piloto falla, registrar la causa concreta y corregirla antes del ensayo completo. Si los equipos no alcanzan, conservar la modalidad coordinada y programar la modalidad de clientes reales en el laboratorio cuando la cátedra defina la fecha.
