# Unidad 07 · Despliegue verificable de prueba

Esta consigna completa el encuentro 7 usando el objetivo de la hoja de ruta. Primero se ensaya localmente. La ejecución en Sepolia requiere que el estudiante configure su cuenta exclusiva de prueba.

## Preparación

Pruebas locales completas. El recorrido remoto necesita un RPC, una cuenta exclusiva de prueba y saldo de testnet.

Los comandos se ejecutan desde la carpeta `laboratorio` del repositorio.

```sh
npm run sepolia -- --check
```

## Trabajo autónomo

1. Ejecutá el despliegue local y completá el registro con red, dirección y hash.
2. Leé .env.example y el script desplegar-sepolia.mjs. Identificá las comprobaciones de red y autorización explícita.
3. Configurá un RPC de Sepolia y una cuenta nueva de prueba en tu propio entorno. No pegues secretos en archivos de entrega.
4. Obtené saldo de prueba mediante un faucet de la documentación de Sepolia, si está disponible.
5. Ejecutá el modo de comprobación del script. Solo después ejecutá el despliegue con la opción explícita indicada en el README.
6. Guardá el recibo, comprobá bytecode y una lectura del contrato. Si usaste explorador, agregá el enlace de la instancia.

## Evidencia

Registro de despliegue con parámetros públicos y resultados. Si no hay acceso a faucet/RPC, entregar el ensayo local y el diagnóstico de la dependencia externa pendiente.

## Criterios de comprobación

- El script comprueba la red antes de firmar.
- La dirección tiene código y responde una lectura.
- El informe no contiene secretos ni URL con credenciales.

## Extensión

Verificar el código fuente del contrato en un explorador y explicar qué demuestra esa verificación.

## Material relacionado

- [Apunte de la unidad](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-07.html)
- [Actividad de aplicación](../../actividades/unidad-07.md)
- [Preparación del laboratorio](../../laboratorio/README.md)
