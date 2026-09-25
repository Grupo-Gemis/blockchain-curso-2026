# Unidad 05 · Interfaz conectada y pruebas funcionales

Se usa el contador de las clases anteriores para concentrarse en la integración. La interfaz distingue consultas y transacciones, y dispone de un modo local sin wallet externa.

## Preparación

Contador implementado y desplegado. Completar ui/cliente.js antes de probar escrituras.

Los comandos se ejecutan desde la carpeta `laboratorio` del repositorio.

```sh
npm test -- Interfaz
npm run interfaz
```

## Trabajo autónomo

1. Completá enviarYConfirmar en laboratorio/ui/cliente.js. Debe producir tres estados en orden: solicitud de firma y envío, Pendiente con transaction hash y Confirmada después de un receipt válido. Debe devolver el receipt y propagar errores.
2. Iniciá el nodo y desplegá el laboratorio siguiendo el README.
3. Ejecutá npm run interfaz y abrí la URL local que informa el servidor.
4. Elegí la cuenta local de prueba. Verificá red, dirección del contrato y valor actual.
5. Incrementá, observá el estado enviado y esperá la confirmación antes de comprobar el nuevo valor.
6. Seleccioná otra cuenta local e intentá reiniciar. Documentá el rechazo. Volvé a la cuenta propietaria y comprobá el reinicio.
7. Simulá una desconexión apagando tu nodo. Anotá el mensaje y el comportamiento del botón.

## Evidencia

Matriz de seis casos con precondición, acción, resultado esperado y observado. Incluir al menos una escritura confirmada y un rechazo esperado.

## Criterios de comprobación

- La UI obtiene el estado del contrato.
- El éxito se presenta después de comprobar el recibo.
- Una cuenta no autorizada no puede reiniciar.

## Extensión

Agregar un control incrementarEn y mantener la misma gestión de estados y errores.

## Material relacionado

- [Apunte de la unidad](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-05.html)
- [Actividad de aplicación](../../actividades/unidad-05.md)
- [Preparación del laboratorio](../../laboratorio/README.md)
