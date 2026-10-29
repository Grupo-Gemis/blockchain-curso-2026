# Una red con nodos independientes

En esta modalidad cada computadora ejecuta su propio programa con Node.js 24. El navegador muestra y controla el nodo local. Los programas se comunican directamente por HTTP con las direcciones de sus compañeros y verifican las firmas recibidas. En una misma red local no necesitan un servidor central ni Internet durante la sesión. **Si cada estudiante está en su casa, se conectan por Internet mediante la [guía para la cursada a distancia](DESDE-CASA.md)**. Esa guía configura una red privada virtual y explica sus dependencias de conectividad.

La modalidad de [navegadores con coordinador](README.md) sigue disponible para una primera experiencia. Allí solo una computadora necesita Node.js y su caída interrumpe el intercambio. **Abrir muchas pestañas de esa modalidad no descentraliza su transporte.**

## Qué se descentraliza

Cada estudiante crea y conserva su propia clave, cola de transacciones, copia del historial, saldos y decisiones firmadas. Cada nodo valida los datos y se comunica con los demás. El proponente rota. No puede certificar su bloque por sí solo. Una computadora que recibe un certificado lo verifica antes de incorporarlo y lo vuelve a compartir.

Una persona reúne las invitaciones públicas para preparar la configuración inicial. Después puede apagar su computadora sin privar al resto de un servicio especial. Si también participa como validador, su ausencia cuenta como cualquier otra. Cada grupo compara el archivo común antes de comenzar. La confianza inicial en quiénes son los integrantes se acuerda fuera del protocolo.

Esta red tiene **miembros conocidos, identidades fijas y peso igual**. Es una red didáctica con consenso propio. No es Ethereum PoS, una testnet pública ni un cliente EVM. No resuelve el ingreso abierto de identidades, el stake, las penalizaciones, las bifurcaciones de Ethereum ni su temporización. Tener transporte entre pares no vuelve idéntico su consenso al de Ethereum.

## Elegir la cantidad del curso

Se admiten **de 2 a 60 nodos**. El número se obtiene de las invitaciones. Con N participantes, el quórum es `floor(2 × N / 3) + 1`: un entero estrictamente mayor que dos tercios. Cada ciclo de N turnos asigna una propuesta a cada identidad. Todos comienzan con 1 ETH ficticio.

| Estudiantes o nodos N | Firmas necesarias Q | Ausencias máximas para reunir Q |
|---|---|---|
| 3 | 3 | 0 |
| 4 | 3 | 1 |
| 6 | 5 | 1 |
| 10 | 7 | 3 |
| 20 | 14 | 6 |
| 30 | 21 | 9 |

El máximo de ausencias es N − Q. Además, los restantes deben poder comunicarse y decidir lo mismo. La admisión hasta 60 es un límite del programa, no una certificación de rendimiento para 60 computadoras. Para una primera clase se puede trabajar con grupos de cuatro y después integrar diez. El bloque sigue permitiendo tres transferencias para hacer visible la escasez de espacio, independientemente de cuántos nodos haya.

## 1. Preparar una computadora por estudiante

Todos necesitan Node.js 24 LTS y esta carpeta del repositorio. No hace falta ejecutar `npm install`. La biblioteca de firmas ya está incluida. Abran una terminal dentro de `laboratorio/ejemplos/red-aula` y comprueben:

```sh
node --version
npm test
```

El primer comando debe informar una versión 24 o posterior. El segundo ejecuta las pruebas y crea solo datos temporales de ensayo.

Acuerden un número de nodo por estudiante, del 1 a N sin saltos. Anoten el nombre y la dirección IPv4 que podrán alcanzar sus compañeros. En la misma red física se usa la dirección local. Desde casas distintas se usa la dirección de la VPN del curso, siguiendo DESDE-CASA.md. Una dirección como `192.168.1.21` es un ejemplo que debe sustituirse por la real. `127.0.0.1` señala la propia computadora y no sirve como dirección para otros dispositivos.

## 2. Arrancar mi nodo y crear mi identidad

Por ejemplo, Ana recibe el número 1 y su computadora tiene dirección `192.168.1.21`:

```sh
npm run nodo -- --id 1 --nombre "Ana" --anunciar http://192.168.1.21:4781
```

Bruno, en otra computadora y con otra dirección, usa su número:

```sh
npm run nodo -- --id 2 --nombre "Bruno" --anunciar http://192.168.1.22:4781
```

Todos pueden usar el puerto 4781 porque son computadoras diferentes. Para un ensayo con varios procesos en una sola computadora, cada proceso necesita un puerto distinto y su propia carpeta de datos:

```sh
npm run nodo -- --id 1 --nombre "Ana" --puerto 4781 --anunciar http://127.0.0.1:4781 --datos datos-nodo-1
npm run nodo -- --id 2 --nombre "Bruno" --puerto 4782 --anunciar http://127.0.0.1:4782 --datos datos-nodo-2
```

Cada comando se mantiene abierto en una terminal distinta. Para completar un ensayo con cuatro nodos, repitan para 3 y 4 con puertos 4783 y 4784. La prueba de caída es más clara con cuatro, porque tres siguen alcanzando el quórum.

La terminal muestra **Mi control local**. Abran ese enlace en su propio navegador. El acceso incluye una clave para operar ese nodo. Compartan solo la invitación pública, no ese enlace ni la carpeta de datos. El panel funciona desde el navegador y no solicita claves de wallets reales.

El programa crea `datos-nodo-1`, o el nombre indicado con `--datos`. Allí guarda `identidad.json`, `invitacion.json` y, después de configurar la red, `estado.json`. Solo `invitacion.json` es público. Las carpetas de datos quedan excluidas de Git con el nombre predeterminado. No usen una carpeta de datos compartida ni copien la de otra persona.

## 3. Acordar el mismo archivo de red

En el panel de cada nodo aparece una invitación compacta firmada. Incluye número, nombre, dirección de conexión y dirección pública de firma. Cada estudiante comparte ese texto o descarga **Guardar mi invitación pública**.

En una de las computadoras, abran **Reunir invitaciones y crear el archivo para el curso**. Peguen una invitación compacta por línea, completen el nombre del curso y pulsen **Crear y guardar red.json**. El programa comprueba firmas, identidades consecutivas y direcciones distintas. El número de estudiantes se adapta a la cantidad de invitaciones.

Distribuyan ese mismo `red.json` a todos. Cada estudiante lo carga desde **Cargar el mismo red.json** en su panel. Comparen la huella de **Archivo común**. Debe ser idéntica en todos los nodos. También deben coincidir la huella del génesis, la cantidad y el quórum. Revisen los nombres y las direcciones que integran el curso.

Crear otro archivo, aunque tenga los mismos nombres, puede producir otra semilla y otra red. **No pulsen crear en cada computadora. Creen una vez y distribuyan el mismo archivo.** La persona que lo creó no conserva un poder especial.

Como alternativa al panel, reúnan los archivos de invitación en una carpeta `invitaciones` y ejecuten:

```sh
npm run crear:red -- --invitaciones invitaciones --salida red.json --nombre "Curso Blockchain"
```

El comando no sobrescribe un archivo existente. También se puede cargar un archivo al arrancar:

```sh
npm run nodo -- --id 1 --nombre "Ana" --anunciar http://192.168.1.21:4781 --red red.json
```

## 4. Comprobar la comunicación

Esperen a que aparezcan los compañeros con **Comunicación directa**. Cada nodo intercambia su estado con los otros aproximadamente cada 1,5 segundos, verifica lo recibido y comparte lo que sabe. La cola puede diferir durante la difusión.

Desde otra computadora se puede abrir `http://DIRECCION-DEL-NODO:4781/api/state` para comprobar que responde. Esa consulta muestra datos públicos. Operar un nodo requiere su acceso de control local. Si el sistema pregunta por el permiso de conexiones entrantes, habiliten Node.js para la red privada de la práctica. El Wi-Fi debe permitir conexiones entre dispositivos. Algunas redes de invitados las bloquean aunque todos tengan Internet.

Antes de votar, comparen el turno y la huella del último bloque. No se acepta una cadena simplemente por ser más larga. Cada nodo comprueba certificados, enlaces y ejecución desde génesis y exige que el historial recibido extienda su copia certificada.

## 5. Proponer, comprobar y certificar

1. Todos envían una transferencia pequeña a otro nodo. Ofrezcan propinas diferentes y comparen las colas después de la difusión.
2. El nodo asignado para proponer pulsa **Elegir por propina efectiva** o elige manualmente hasta tres operaciones. Firma y difunde la selección.
3. Cada estudiante pulsa **Comprobar en mi copia**. Su nodo y su navegador ejecutan las reglas y comprueban firmas, enlace, gas, nonces, fondos y estado.
4. Se reúnen Q − 1 aprobaciones y se observa que no hay bloque certificado. Una persona más aprueba y completa Q.
5. Los nodos verifican el certificado, incorporan el bloque y pasan al siguiente turno. No interviene una computadora docente para habilitarlo.
6. Comparan hashes, saldos, quema, propinas y el registro de decisiones. La base cobrada se quema. La práctica no emite recompensas nuevas.

En un curso de diez, Q es siete. En otro de veinte es catorce. Cada identidad pesa una vez. Las decisiones firmadas se guardan antes de difundirse. El programa no permite firmar otra decisión del mismo turno después de reiniciar.

## 6. Detener un nodo y mantener la red

Para probar descentralización, detengan con **Ctrl+C** uno de los nodos, preferentemente el de quien creó `red.json`. Dejen los demás programas en ejecución. Con diez nodos, nueve conservan más de siete participantes y pueden certificar. Con cuatro nodos, tres alcanzan exactamente el quórum.

Si el nodo detenido era el proponente, los restantes pulsan **Firmar pasar turno / rechazar**. Al reunir Q firmas sobre esa decisión, el turno se registra como omitido y cambia el proponente. No se agrega un bloque ni se cobra gas por pasar el turno. Ningún nodo puede imponer ese cambio solo.

Propongan y certifiquen un bloque válido con los nodos que siguen conectados. **La evidencia es que el último bloque avanza sin la computadora detenida.** Si se desconectan tantos que quedan menos de Q, nadie puede certificar ni pasar el turno. Con diez, cuatro ausencias dejan seis y la red se detiene a la espera de suficientes participantes.

## 7. Recuperar una copia atrasada

Vuelvan a ejecutar el mismo comando del nodo detenido, con el mismo número, dirección y carpeta de datos. Recupera su identidad y sus decisiones anteriores. Al contactar a los pares reconstruye los turnos que faltan desde génesis y verifica sus firmas y ejecución. Comparen la huella final y los saldos con otro estudiante.

No borren la carpeta para reconectar. Borrarla pierde la identidad y sus restricciones de firma. Para probar otra cursada con otros participantes, conserven la evidencia y utilicen otra carpeta mediante `--datos`.

## 8. Rechazar un estado alterado y observar un bloqueo

El proponente activa **Experimento: alterar la huella del estado** y difunde. Los demás comprueban el bloque. La firma identifica quién lo propuso, pero la ejecución no coincide. Cada participante firma **pasar turno / rechazar**. Al reunir Q firmas, la red pasa de turno sin incorporar el bloque inválido.

Una identidad decide **aprobar ese bloque** o **pasar ese turno**. No puede hacer ambas cosas. Si el grupo se divide y ninguna decisión reúne Q, el modelo puede quedar detenido incluso si todos están conectados. Esta simplificación no implementa un protocolo completo de cambio de vista o resolución de bloqueos. No se arregla habilitando firmas contradictorias. Guarden la evidencia y expliquen el bloqueo antes de preparar una nueva sesión.

Los turnos son manuales para que el grupo decida cuándo actuar. No hay un reloj ni un administrador central que pueda borrar una decisión. Un historial admite hasta 200 turnos por sesión. El software intercambia estados completos para facilitar la observación, sin optimizaciones para redes grandes.

## 9. Evidencia de cada participante

Pulsen **Guardar evidencia pública**. Incluye configuración, invitaciones públicas, historial de decisiones, bloques y firmas, saldos, observaciones del nodo y resultado de la comprobación del navegador. No exporta la clave privada ni el acceso de control.

Cada estudiante debe identificar su propuesta, una operación que comprobó, una comisión completa y un certificado. Para la prueba de caída, registren qué nodo se detuvo, cuántos quedaron, qué turno se omitió y qué bloque avanzó. Al reconectar comparen la huella final. No confundan un indicador de conexión con un voto firmado.

## Ethereum y esta experiencia

En Ethereum, los clientes se conectan a redes entre pares. Un nodo completo verifica datos con clientes de ejecución y consenso. Un validador agrega claves y deberes de consenso. El proponente cambia por asignación del protocolo y el resto comprueba, sin que exista una computadora docente global. La descentralización combina copias verificadas, operadores independientes, comunicación entre pares y reglas comunes. No exige que todas las personas propongan simultáneamente.

La práctica reproduce comunicación directa, firmas, propuestas, comprobación independiente, certificados y recuperación. Sus reglas de peso igual, rotación sin repeticiones, decisiones manuales y finalidad por sucesor son didácticas. Para ejecutar Ethereum real hay que usar sus clientes y reglas.

Fuentes primarias: [arquitectura de un nodo de Ethereum](https://ethereum.org/developers/docs/nodes-and-clients/node-architecture/), [comunicación entre pares](https://ethereum.org/developers/docs/networking-layer/) y [mecanismos de consenso](https://ethereum.org/developers/docs/consensus-mechanisms/).
