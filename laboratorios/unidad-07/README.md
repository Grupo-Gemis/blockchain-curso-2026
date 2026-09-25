# Unidad 07 · Deployment local verificable y extensión en Sepolia

El recorrido obligatorio se completa en la red local. No requiere saldo real, faucet ni una cuenta de proveedor RPC. La extensión en Sepolia permite comparar el mismo procedimiento con una red compartida.

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

Si se dispone de un RPC y saldo de prueba gratuitos, realizar --check y luego --desplegar según el README de Sepolia. No comprar saldo, contratar servicios ni usar fondos reales. La falta de estos recursos no afecta la entrega ni su evaluación.

## Material relacionado

- [Apunte de la unidad](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-07.html)
- [Actividad de aplicación](../../actividades/unidad-07.md)
- [Preparación del laboratorio](../../laboratorio/README.md)
