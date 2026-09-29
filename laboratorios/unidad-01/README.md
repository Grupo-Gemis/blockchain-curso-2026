# Unidad 01 · Entorno verificado y cadena de hashes

## Qué vamos a observar

El apunte sigue el recorrido de un pago de Ana a una librería. En esta práctica usamos textos sobre ese pago para construir una cadena de tres bloques y observar cómo depende cada bloque del anterior.

El programa calcula hashes reales con SHA-256, pero los registros son didácticos. No ejecuta pagos ni valida saldos. Tampoco implementa firmas, minería, validadores o consenso. La propiedad que vamos a comprobar es la **consistencia de los hashes y sus enlaces**.

Al terminar deberías poder explicar por qué una cadena alterada puede volver a pasar una verificación local después de recalcularla, y por qué eso no demuestra que una red blockchain la aceptaría.

## 1. Preparar el entorno

Descargá o cloná el repositorio. Abrí una terminal en la carpeta `laboratorio`, donde están `package.json` y la carpeta `scripts`. El entorno del curso requiere Node.js 22.13 o superior y fue probado con Node.js 24.

Ejecutá cada línea por separado:

```sh
node --version
npm --version
npm ci
npm run verificar
```

- **Node.js** ejecuta JavaScript desde la terminal.
- **npm** instala dependencias y ejecuta los comandos definidos por el proyecto.
- **Hardhat** permite compilar y probar contratos y levantar una red de desarrollo en las próximas unidades.

`npm ci` instala las versiones fijadas por el proyecto y requiere conexión para descargar las que falten. El verificador muestra las versiones de Node.js, npm, Hardhat, ethers y OpenZeppelin. Si informa una dependencia ausente, la preparación todavía no está completa.

Para ejecutar solamente la demostración de hashes alcanza con Node.js: utiliza módulos incluidos y puede ejecutarse con `node scripts/cadena.mjs` sin instalar dependencias adicionales.

## 2. Predecir antes de ejecutar

Cada bloque tiene cuatro campos:

| Campo | Significado |
|---|---|
| `indice` | Posición del bloque: 0, 1 o 2. |
| `dato` | Texto guardado como contenido. |
| `anterior` | Hash del bloque precedente. El primer bloque utiliza `0`. |
| `hash` | SHA-256 de la codificación de los tres campos anteriores. |

La expresión utilizada es `SHA256(JSON.stringify([indice, dato, anterior]))`, con codificación UTF-8. Guardar el hash anterior dentro de la entrada del siguiente crea la dependencia.

El script conserva el hash final de la cadena inicial como referencia. Esa referencia se mantiene aparte mientras el programa altera la cadena. En un sistema real también habría que justificar por qué se confía en el origen y la conservación de esa referencia.

Antes de ejecutar, completá tus predicciones:

| Etapa | ¿La cadena será consistente? | ¿Coincidirá el hash final con el original? |
|---|---|---|
| Cadena inicial | | |
| Cambiar el importe del bloque 0 sin recalcular | | |
| Recalcular solo el hash del bloque 0 | | |
| Recalcular todos los hashes y sus enlaces | | |

## 3. Ejecutar y seguir las cuatro etapas

```sh
npm run cadena
```

El programa muestra el texto, la referencia anterior y el hash guardado de cada bloque. También informa si la cadena es consistente y explica las inconsistencias.

### Etapa 1: cadena inicial

El primer registro dice que Ana solicita pagar 70.000 satoshis. Los bloques posteriores representan registros posteriores. Cada hash coincide con los datos que resume y cada referencia apunta al hash anterior correcto.

**Resultado esperado:** consistencia `true` y coincidencia con la referencia original `true`.

### Etapa 2: se altera un dato

El importe del primer registro cambia de 70.000 a 90.000. Los hashes guardados todavía no se modifican. Al calcular de nuevo el hash del bloque 0, el verificador obtiene un valor distinto del guardado.

**Resultado esperado:** consistencia `false`. La salida identifica el bloque 0. El hash final aún coincide con el original porque todavía no se recalculó: comparar solamente ese campo no detectaría esta alteración.

### Etapa 3: se recalcula solo el primer hash

El bloque 0 vuelve a coincidir con su contenido alterado. Sin embargo, el bloque 1 sigue guardando la referencia al hash viejo del bloque 0. Esa referencia ya no coincide con el hash del bloque precedente.

**Resultado esperado:** consistencia `false`. Ahora la salida identifica la referencia del bloque 1. El hash final todavía coincide con el original.

### Etapa 4: se recalculan todos los enlaces

El programa actualiza la referencia del bloque 1 y recalcula su hash. Luego hace lo mismo con el bloque 2. Todos los campos vuelven a ser coherentes entre sí.

**Resultado esperado:** consistencia `true` y coincidencia con la referencia original `false`.

La secuencia de consistencia es **`true → false → false → true`**. La última etapa representa otra historia internamente consistente. El hash final conocido permite detectar la sustitución una vez verificada la cadena completa. Nada de este procedimiento implementa el acuerdo de una red.

## 4. Interpretar los resultados

Usá estas preguntas para preparar tu explicación:

1. ¿Qué dos comparaciones realiza el verificador sobre cada bloque, además de revisar su posición?
2. ¿Por qué recalcular el primer hash no alcanza para reparar el enlace siguiente?
3. ¿Por qué el hash final sigue siendo el original en las etapas 2 y 3 aunque la cadena sea inconsistente?
4. ¿Qué demuestra la etapa 4 y qué haría falta para hablar de una historia aceptada por una red?
5. ¿Cómo se relacionan estos resultados con el costo de reescritura en PoW y con los votos y la finalización en PoS?

No hace falta implementar PoW o PoS. La pregunta 5 es conceptual y se responde a partir del apunte.

## Evidencia a entregar

Un archivo `entorno.txt` que contenga:

- Las versiones y la salida del verificador.
- La salida de `npm run cadena` con sus cuatro etapas.
- Una explicación propia de **150 a 200 palabras** sobre alteración, recálculo y consenso. Incluí qué permite comprobar la referencia original.

## Criterios de comprobación

- El entorno no informa versiones incompatibles ni dependencias ausentes.
- Se reconoce qué inconsistencia detectan las etapas 2 y 3.
- Se interpreta correctamente la secuencia `true, false, false, true`.
- Se distingue la consistencia local del acuerdo distribuido y de la autenticidad de los datos.

## Si aparece un error

| Mensaje o situación | Siguiente comprobación |
|---|---|
| `node` no se reconoce | Revisar la instalación y abrir una terminal nueva. |
| No se encuentra `package.json` o `scripts/cadena.mjs` | Comprobar que la terminal esté en `laboratorio`. |
| El verificador informa una biblioteca ausente | Ejecutar `npm ci` desde `laboratorio` y repetir el verificador. |
| La cadena da `false` en las etapas 2 y 3 | Es el resultado esperado de la alteración. Leer el motivo. |

Registrá el comando, el mensaje completo y la carpeta desde la que lo ejecutaste. Cambiá una condición por vez.

## Explorar firmas y nonce en el apunte

En el [ejemplo de firmas](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-01.html#signature-lab), las claves ya están preparadas. Compará estas situaciones:

1. Ana firma el mensaje original y tiene permiso.
2. El mensaje cambia después de firmarse.
3. Carlos firma y se verifica con la clave pública de Carlos, pero el permiso sigue siendo de Ana.
4. Ana firma correctamente, pero los fondos ya se gastaron.

Registrá por separado si la firma es válida y si la operación queda autorizada. Podés desplegar las claves de práctica y regenerarlas.

En el [ejemplo de nonce](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-01.html#nonce-lab), probá un nonce, avanzá al siguiente y compará los hashes. Luego:

1. Cargá el ejemplo resuelto. Comprobá que el hash comienza con `00`.
2. Cambiá el importe y volvé a comprobar el mismo nonce.
3. Restablecé el ejemplo e iniciá una búsqueda automática.
4. Repetí con uno, dos y tres ceros. Compará intentos observados con promedios esperados.

El número de intentos puede variar. El promedio no garantiza que una búsqueda termine antes de esa cantidad. Estos dos ejemplos amplían la exploración y no cambian la entrega de `entorno.txt`.

## Extensión opcional

Guardá una copia del script y probá una alteración que agregue solo un espacio al texto. Predecí si cambiarán los hashes y repetí la ejecución. Después explicá por qué un hash no es cifrado y por qué una firma válida no permite gastar dos veces la misma salida.

## Material relacionado

- [Apunte de la unidad](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-01.html)
- [Actividad de aplicación](../../actividades/unidad-01.md)
- [Preparación general del laboratorio](../../laboratorio/README.md)
