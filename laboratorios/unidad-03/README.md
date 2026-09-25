# Unidad 03 · Contador con propietario y eventos

La práctica usa Remix VM para la primera ejecución y el mismo contrato en el proyecto local. No necesita una testnet pública. La versión completa se encuentra en el código docente; el ejercicio ofrece una plantilla para completar.

## Preparación

Editor de código, Node.js y dependencias del laboratorio.

Los comandos se ejecutan desde la carpeta `laboratorio` del repositorio. Las rutas que comienzan con `laboratorios/` se refieren a la raíz del repositorio.

```sh
npm run compilar
npm test -- Contador
```

## Trabajo autónomo

1. Abrí laboratorio/contracts/Contador.sol en el repositorio. Identificá los datos de estado, el constructor y las funciones pendientes.
2. Completá incrementar para sumar uno y emitir el nuevo valor. Completá el control de reiniciar usando msg.sender.
3. Compilá y desplegá desde la primera cuenta. Registrá el valor inicial.
4. Ejecutá incrementar dos veces y comprobá el estado y los eventos.
5. Cambiá a otra cuenta e intentá reiniciar. Volvé a la cuenta propietaria y repetí. Explicá la diferencia.

## Evidencia

Código compilable, tabla de cinco operaciones con cuenta, resultado esperado y observado, y reflexión personal sobre la dificultad.

## Criterios de comprobación

- El valor inicial es cero y dos incrementos dejan dos.
- Una cuenta no autorizada no reinicia el contador.
- La cuenta propietaria puede reiniciarlo.

## Extensión

Agregá incrementarEn(uint256 cantidad) con una condición que rechace cero. Escribí casos de prueba para ambas ramas.

## Material relacionado

- [Apunte de la unidad](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-03.html)
- [Actividad de aplicación](../../actividades/unidad-03.md)
- [Preparación del laboratorio](../../laboratorio/README.md)
