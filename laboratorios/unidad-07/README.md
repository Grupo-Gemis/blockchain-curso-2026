# Unidad 07 · Deployment local verificable y extensión en Sepolia

El recorrido obligatorio se completa en la red local. No requiere saldo real, faucet ni una cuenta de proveedor RPC. La extensión en Sepolia permite comparar el mismo procedimiento con una red compartida.

En el recorrido local, cada computadora ejecuta su propio nodo Hardhat y conserva un estado independiente. Dos estudiantes con chainId 31337 no están conectados automáticamente entre sí. En Sepolia usamos una red pública de prueba que ya funciona en Internet, operada por participantes externos al curso. Nuestra computadora envía o consulta como cliente. No se convierte en validador por usar esa red.

## Preparación

Contador implementado y pruebas locales aprobadas. No se necesita una cuenta de proveedor RPC.

Los comandos se ejecutan desde la carpeta `laboratorio` del repositorio. Las rutas que comienzan con `laboratorios/` se refieren a la raíz del repositorio.

```sh
npm run compilar
# Con npm run nodo activo en otra terminal
npm run desplegar
npm run verificar:deployment
```

## Trabajo autónomo

1. Ejecutá npm run compilar. Iniciá npm run nodo en una terminal y npm run desplegar en otra, ambas desde laboratorio.
2. Ejecutá npm run verificar:deployment. Inspeccioná resultados/verificacion-deployment.json e identificá red, dirección, transacción, código y lectura.
3. Compará el informe con ui/despliegue.json. Explicá qué comprueba cada campo y qué no demuestra sobre la seguridad del contrato.
4. Detené y reiniciá tu propio nodo local. Volvé a ejecutar el verificador antes de desplegar otra vez y explicá el rechazo del registro anterior.
5. Repetí el deployment y la verificación. Documentá las comprobaciones anteriores y posteriores al reinicio.
6. Leé .env.example y scripts/desplegar-sepolia.mjs. Explicá qué cambia para una red compartida y por qué el script detiene un chainId incorrecto. Ejecutar en Sepolia es opcional.

## Evidencia

Informe JSON del verificador, tabla de resultados antes y después del reinicio y explicación de las diferencias con Sepolia. El recorrido local satisface todos los criterios obligatorios.

## Criterios de comprobación

- El chainId observado es 31337 y coincide con el registro.
- El receipt exitoso corresponde a la dirección y los datos de creación corresponden al artifact del Contador.
- La dirección tiene código y permite leer valor y propietario.
- El verificador rechaza el registro después de reiniciar el nodo antes de realizar un nuevo deployment.
- El informe contiene datos públicos y no incluye secretos ni URL con credenciales.

## Extensión

Si se dispone de un RPC y saldo de prueba gratuitos, realizar --check y luego --desplegar según los pasos del apunte de la unidad 07. No comprar saldo, contratar servicios ni usar fondos reales. La falta de estos recursos no afecta la entrega ni su evaluación.

## Material relacionado

- [Apunte de la unidad](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-07.html)
- [Actividad de aplicación](../../actividades/unidad-07.md)
- [Preparación del laboratorio](../../laboratorio/README.md)

## Qué se configura en cada modalidad

La interfaz guiada usa la cuenta seleccionada en la wallet y exige Sepolia 11155111 tanto en la página como en la wallet. No solicita `.env`, firma escrita a mano ni clave privada. Para una creación nueva, dirección del contrato y hash se obtienen del envío y el recibo. Para abrir un contrato existente se usan los datos completos compartidos por su creador.

La variante por terminal usa `scripts/desplegar-sepolia.mjs`. En `.env`, `SEPOLIA_RPC_URL` contiene la URL real del acceso RPC a Sepolia. No es la URL del explorador ni la dirección de un contrato. `SEPOLIA_PRIVATE_KEY` contiene la clave privada de una cuenta exclusiva de prueba. No es su dirección, una firma ni la frase de recuperación. Esa clave no forma parte de ninguna entrega.

El modo `--check` consulta red, cuenta, saldo y estimación sin enviar. El modo `--desplegar` firma y envía con la cuenta configurada, sin abrir la confirmación de una extensión de wallet. El constructor de Contador no recibe argumentos. En ambos modos de envío se requiere saldo de prueba suficiente para la comisión, cuyo importe cambia según las condiciones de la red.

## Resultados de la extensión opcional

`npm run sepolia -- --check` consulta y estima sin enviar. El modo `--desplegar` espera una creación y guarda `laboratorio/resultados/deployment-sepolia.json` con datos públicos: red, dirección, hash, bloque, resultado, cuenta creadora, propietario, valor, gas y comisión. La URL y la clave no se copian. No cambia el registro local de la DApp.

Los tests `Deployment` revisan el verificador local y sus rechazos. No ejecutan la extensión ni califican la tabla o el informe escrito.


## Práctica conjunta de las unidades 06 y 07

“Conjunta” significa que combina ambas unidades y permite observar u operar sobre un mismo contrato de Sepolia desde distintas computadoras. Puede firmar solo el docente y el resto observar. Si también firma otra cuenta, debe usar la misma red y dirección del contrato. Las computadoras de la clase no forman el conjunto de validadores de Sepolia. Los nodos externos verifican por software y los validadores asignados participan del consenso.

Una transacción incluida tiene una comisión según el gas cobrado y el precio efectivo. No se multiplica por la cantidad de nodos que comprueban su resultado. Crear e incrementar pagan con ETH de prueba en Sepolia. Consultar mediante eth_call no publica una transacción ni descuenta una comisión de transacción a la cuenta. Los consumos reales se obtienen de los recibos, no del número de computadoras conectadas.

La [guía completa de gas, transacciones e historia](../../laboratorio/ejemplos/testnet-observable/GUIA-06-07.md) continúa el contador de 04/05. Desde laboratorio, ejecutá npm run preparar:testnet y seguí EMPEZAR-AQUI.md de la copia. El código está completo y los ejercicios originales se conservan.

Primero ensayamos localmente. Luego el docente guía la creación en Sepolia, los incrementos, la comisión efectiva, la reversión incluida, la consulta desde otra computadora, la historia y el seguimiento de finalización. Quienes no firman pueden observar desde el explorador. La entrega local conserva los criterios anteriores cuando no hay recursos públicos gratuitos.

La evidencia adicional distingue red local y Sepolia. Incluye tabla de operaciones, recibos y JSON de observaciones, más una explicación de qué permiten comprobar dos accesos RPC y qué requiere observar el consenso. Los tests locales no acreditan haber ejecutado la parte pública.
