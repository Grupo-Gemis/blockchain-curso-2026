# Unidad 03 · Contador con propietario y eventos

El [encuentro 02](https://grupo-gemis.github.io/blockchain-curso-2026/encuentro-02.html#lectura-02-contrato) explica qué estado conserva un smart contract y cómo comprueba permisos. Ahora vas a completar un contador que permite incrementar a cualquier cuenta y reservar el reinicio a quien lo desplegó. Todo se ejecuta en el entorno local del curso.

## 1. Predecir el comportamiento

Antes de editar código, anotá el valor esperado después de cada paso. Ana despliega el contrato. Bruno incrementa dos veces. Bruno intenta reiniciar. Ana reinicia. Registrá para cada llamada quién es `msg.sender`, si debe tener éxito y qué valor debería leerse después. El reinicio rechazado debe conservar el valor anterior.

## 2. Completar la plantilla

Abrí [laboratorio/contracts/Contador.sol](../../laboratorio/contracts/Contador.sol). Ya están declarados `valor`, `propietario`, el constructor, el evento `ValorCambiado`, el error `NoAutorizado` y dos funciones con `TODO`. Completá:

1. `incrementar()`: aumentar `valor` en uno y emitir `ValorCambiado` con el llamador y el nuevo valor.
2. `reiniciar()`: comprobar que `msg.sender` sea `propietario`. Si no lo es, revertir con `NoAutorizado`. Si lo es, fijar `valor` en cero y emitir el evento.

El error `PendienteDeImplementacion` marca la plantilla inicial. Quitá sus llamadas de las funciones que completaste. Podés usar [el simulador de la lectura](https://grupo-gemis.github.io/blockchain-curso-2026/encuentro-02.html#simulador-02) para anticipar el resultado; la prueba del contrato será la comprobación real del programa.

## 3. Compilar y probar

Desde la carpeta `laboratorio` del repositorio:

```sh
npm ci
npm run compilar
npm test -- Contador
```

`npm ci` instala las versiones fijadas por el proyecto. La compilación comprueba que Solidity entienda el archivo; la prueba ejecuta el contrato y verifica estado, evento y permiso. Al comenzar, es esperable que la prueba falle porque la plantilla revierte con `PendienteDeImplementacion`. Después de implementar ambas funciones, el caso `Contador` debe pasar.

Si falla, leé el mensaje completo y distinguí entre un error de compilación y una expectativa de prueba incumplida. Comprobá la cuenta que realizó cada llamada y el valor que quedó guardado después del intento sin permiso.

## Evidencia y comprobación

Entregá el código y una tabla con las cinco observaciones: estado inicial, dos incrementos, reinicio rechazado y reinicio autorizado. Incluí el resultado de la prueba y una breve explicación de por qué el rechazo conserva el valor. No incluyas cuentas o claves de uso real.

## Extensión

Agregá `incrementarEn(uint256 cantidad)` con una condición que rechace cero. Escribí una prueba para una cantidad positiva y otra que compruebe el rechazo de cero.
