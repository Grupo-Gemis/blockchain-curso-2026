# Unidad 04 · Nodo local y despliegue del contador

Se conserva el objetivo de configurar una blockchain local. La práctica termina cuando otra persona puede repetir la secuencia y observar los mismos comportamientos.

## Preparación

Contador implementado. Node.js y dependencias del laboratorio.

Los comandos se ejecutan desde la carpeta `laboratorio` del repositorio. Las rutas que comienzan con `laboratorios/` se refieren a la raíz del repositorio.

```sh
npm run compilar
npm test -- Contador
```

## Trabajo autónomo

1. Desde laboratorio, ejecutá npm ci y npm run compilar. Guardá el nombre del compilador y el resultado.
2. Ejecutá npm run nodo en una terminal que quede abierta.
3. En otra terminal, ejecutá npm run desplegar. Registrá chainId y la dirección de Contador.
4. Ejecutá npm test -- Contador. Explicá cómo se comprueban incrementos, reinicio autorizado y rechazo de otra cuenta.
5. Detené únicamente el nodo que abriste, volvé a iniciarlo y comprobá qué ocurre al consultar una dirección vieja antes de desplegar de nuevo.

## Evidencia

README propio con comandos, direcciones identificadas por red y tabla de pruebas. No incluir claves mostradas por el nodo.

## Criterios de comprobación

- El RPC responde con chainId 31337.
- La dirección desplegada contiene código.
- Los rechazos de permisos se comprueban explícitamente.

## Extensión

Cambiar el puerto de la red local y documentar todos los lugares que deben actualizarse.

## Material relacionado

- [Apunte de la unidad](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-04.html)
- [Actividad de aplicación](../../actividades/unidad-04.md)
- [Preparación del laboratorio](../../laboratorio/README.md)
