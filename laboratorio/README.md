# Laboratorio de Blockchain & Smart Contracts

Herramientas para las diez unidades del curso. **Las unidades 04 y 05 se realizan como prácticas guiadas con código completo.** No requieren resolver primero los ejercicios de programación.

## Empezar las prácticas guiadas 04 y 05

Desde esta carpeta, con Node.js 24:

```sh
npm run preparar:guiado
cd practicas/unidades-04-05
npm ci
npm run verificar
npm run compilar
npm test
```

El primer comando funciona antes de instalar dependencias. Crea una copia con Contador y enviarYConfirmar completos. No sobrescribe trabajos anteriores. Todos los comandos siguientes se ejecutan en esa copia. Su npm test comprueba ocho casos de Contador, Interfaz y Deployment. No exige completar funciones de otras unidades.

Seguí el [laboratorio 04](../laboratorios/unidad-04/README.md) y después el [laboratorio 05](../laboratorios/unidad-05/README.md). Cada paso explica qué hacer, qué ocurre detrás, qué observar y cómo comprobarlo. La misma copia sirve para la demostración docente.

Si necesitás otro ensayo, desde la carpeta laboratorio original usá npm run preparar:guiado -- --nombre demostracion-2 y trabajá en practicas/demostracion-2. Las copias existentes no se sobrescriben. Guardá el informe de entrega fuera de esas carpetas locales.

## Ejercicios de programación y demás unidades

La carpeta original conserva los ejercicios con TODO de las unidades 03, 08 y 09. Un test que falla con PendienteDeImplementacion allí señala trabajo aún no realizado. La función pendiente original de ui/cliente.js se conserva como ejercicio adicional, pero no es requisito del laboratorio guiado 05. Las instrucciones generales siguientes corresponden a esa carpeta original.

## Instalación

Usá Node.js 24 y una terminal en esta carpeta.

```sh
npm ci
npm run verificar
npm run compilar
```

La primera instalación y la descarga inicial del compiler necesitan Internet. package-lock.json conserva las versiones de dependencias.

## Recorrido de implementación

| Unidad | Archivo para completar | Comprobación |
|---|---|---|
| 03 | contracts/Contador.sol | npm test -- Contador |
| Adicional de 05 | ui/cliente.js | npm test -- Interfaz |
| 08 | contracts/TokenAula.sol | npm test -- ERC20 |
| 09 | contracts/Bovedas.sol, BovedaSegura | npm test -- Boveda |

`npm test` ejecuta todos los casos. Antes de completar las cuatro implementaciones es normal que fallen los casos pendientes. Las pruebas son especificaciones observables del comportamiento requerido.

## Nodo e interfaz

Terminal 1:

```sh
npm run nodo
```

El nodo escucha en http://127.0.0.1:8545 y usa chainId 31337. Sus cuentas son públicas de desarrollo y solo se utilizan en esta red local.

Terminal 2:

```sh
npm run desplegar
npm run consultar
npm run verificar:deployment
npm run interfaz
```

El despliegue crea solo Contador y actualiza `ui/despliegue.json`. La consulta muestra propietario y valor en esa terminal. Abrí http://127.0.0.1:4173 para usar la interfaz. El contador necesita la implementación de la unidad 03 y las escrituras de la UI necesitan la función de la unidad 05.

La práctica obligatoria utiliza el selector A/B y **Conectar cuenta local**. Una wallet externa es una extensión opcional. Cambiar el selector invalida la conexión hasta reconectar. Reiniciar el nodo borra su estado en esta configuración. Consultá el registro anterior antes de redesplegar para observar la ausencia de código. Luego desplegá, verificá y recargá la interfaz. La dirección puede repetirse, con un estado nuevo.

## Usar el contador desde la terminal

En la unidad 04, antes de iniciar la página, la terminal 2 puede usar la instancia ya desplegada:

```sh
npm run usar:contador -- incrementar --cuenta 1
npm run usar:contador -- incrementar --cuenta 1
npm run consultar
```

La cuenta 0 es A, Ana. La cuenta 1 es B, Bruno. El cliente comprueba el registro de creación, envía la acción, espera el recibo y consulta el valor. No implementa las funciones pendientes del contrato. `reiniciar --cuenta 1` debe rechazarse por permiso y conservar el valor. `reiniciar --cuenta 0` solicita el reinicio autorizado de Ana.

Después de iniciar `npm run interfaz`, la terminal 2 queda ocupada por ese servidor. Abrí una tercera terminal en `laboratorio` si necesitás ejecutar estos clientes mientras usás la página. La URL 4173 carga la interfaz. La 8545 identifica el RPC del nodo. El número 31337 identifica la configuración de red, no un puerto.

## Comandos adicionales

```sh
npm run cadena
npm run medir
node scripts/token.mjs
```

La medición requiere nodo activo y contador implementado. El recorrido del token requiere su constructor completo. Los resultados generados quedan fuera de Git.

## Verificación local sin costo adicional

Todos los laboratorios obligatorios se completan en la red local. No requieren fondos reales, tarjeta, una suscripción, una hardware wallet ni una cuenta de proveedor RPC. La computadora y la conexión para la instalación inicial son los recursos de trabajo. Se puede usar cualquier editor gratuito. Las plantillas CSV se abren en LibreOffice Calc o Google Sheets, sin necesidad de comprar Microsoft Excel.

Después de desplegar:

```sh
npm run verificar:deployment
```

El comando verifica red, receipt, dirección, datos de creación, código y lectura del contador. Genera `resultados/verificacion-deployment.json`. Para Contador se comparan los datos de creación con el artifact, ya que su constructor no recibe argumentos. Su runtime contiene un propietario immutable y no debe compararse literalmente con el placeholder del compiler.

## Testnet opcional

Copiá .env.example como .env y configurá tu RPC y una cuenta exclusiva de prueba. No incluyas ese archivo ni recovery phrases en entregas.

```sh
npm run sepolia -- --check
```

Ese modo verifica chainId 11155111, saldo y estimación. Para realizar el envío previsto por la práctica:

```sh
npm run sepolia -- --desplegar
```

El envío requiere saldo de testnet. Solo se realiza si hay un RPC y un faucet gratuitos disponibles, sin comprar saldo ni contratar planes. La verificación local completa satisface la entrega de la unidad 07 y los mismos criterios. Sepolia es una extensión opcional y no condiciona la aprobación.

## Diagnóstico

- Comando desconocido: revisar instalación y PATH en una terminal nueva.
- ECONNREFUSED: verificar que el nodo esté activo.
- Dirección sin código: comprobar red y deployment vigente.
- PendienteDeImplementacion: completar la función indicada en el enunciado.
- NoAutorizado al reiniciar con otra cuenta: rechazo esperado.

Los tests inician y cierran su propio nodo en el puerto 18545. No utilizan el nodo de la interfaz en 8545. El resultado de `hardhat build` se ve en la terminal y en `artifacts/`. Compilar no crea una instancia en la red.

## Alcance de las comprobaciones

Los tests de Contador comprueban sus transiciones y permisos. Los de Interfaz prueban el helper con transacciones y recibos simulados, incluida la espera efectiva. El flujo completo de la página se comprueba con la matriz del [laboratorio 05](../laboratorios/unidad-05/README.md). Los tests no asignan notas ni envían resultados a Moodle. El workflow de GitHub ejecuta los casos configurados en `.github/workflows/comprobaciones.yml`, que son un subconjunto de las pruebas disponibles.


## Caso integrador con código completo

El comando npm run preparar:certificados crea una copia en practicas/certificados. Abrí EMPEZAR-AQUI.md de esa copia. Incluye contrato, interfaz, documentos ficticios y tareas numeradas de VS Code. El preparador conserva las copias previas. El nodo de esta aplicación usa 19645, la interfaz 4273 y las pruebas 19646. El contador de 04/05 conserva su propia carpeta y sus servicios.


## Práctica conjunta de gas y red pública · Unidades 06 y 07

Ejecutá npm run preparar:testnet y abrí EMPEZAR-AQUI.md de la carpeta que informa el comando. Incluye el contador completo, ensayo local, conexión de wallet a Sepolia, costo efectivo, seguimiento de inclusión y finalización, eventos y valores históricos. La copia utiliza puertos propios y conserva los ejercicios originales. La parte pública se prepara con el docente y saldo gratuito. No condiciona la aprobación individual. La guía completa se conserva en ejemplos/testnet-observable/GUIA-06-07.md.
