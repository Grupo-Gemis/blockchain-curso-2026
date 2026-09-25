# Laboratorio de Blockchain & Smart Contracts

Código inicial y herramientas para las diez unidades del curso. Los contratos con TODO se completan progresivamente. Un test que falla con `PendienteDeImplementacion` señala trabajo aún no realizado.

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
| 05 | ui/cliente.js | npm test -- Interfaz |
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
npm run interfaz
```

Abrí http://127.0.0.1:4173. El contador necesita la implementación de la unidad 03. Las escrituras de la UI necesitan la función de la unidad 05. Reiniciar el nodo puede borrar su estado. En ese caso hay que desplegar de nuevo y recargar la interfaz.

## Comandos adicionales

```sh
npm run cadena
npm run medir
node scripts/token.mjs
```

La medición requiere nodo activo y contador implementado. El recorrido del token requiere su constructor completo. Los resultados generados quedan fuera de Git.

## Testnet

Copiá .env.example como .env y configurá tu RPC y una cuenta exclusiva de prueba. No incluyas ese archivo ni recovery phrases en entregas.

```sh
npm run sepolia -- --check
```

Ese modo verifica chainId 11155111, saldo y estimación. Para realizar el envío previsto por la práctica:

```sh
npm run sepolia -- --desplegar
```

El envío requiere saldo de testnet. Si no está disponible, se documenta la limitación y se presenta la comprobación local con los parámetros que cambiarían. El curso no exige fondos reales.

## Diagnóstico

- Comando desconocido: revisar instalación y PATH en una terminal nueva.
- ECONNREFUSED: verificar que el nodo esté activo.
- Dirección sin código: comprobar red y deployment vigente.
- PendienteDeImplementacion: completar la función indicada en el enunciado.
- NoAutorizado al reiniciar con otra cuenta: rechazo esperado.

Los tests inician y cierran su propio nodo en el puerto 18545. No utilizan el nodo de la interfaz en 8545.
