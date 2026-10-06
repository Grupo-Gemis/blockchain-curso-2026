# Blockchain & Smart Contracts · UTN FRBA · 2026

[Abrir los materiales del curso](https://grupo-gemis.github.io/blockchain-curso-2026/)

Los HTML integran teoría, ejemplos, gráficos y actividades. Cada archivo incluye sus imágenes y su navegación. **Lectura** muestra el documento completo. **Presentación** permite avanzar por secciones con botones o flechas del teclado. Los gráficos se pueden ampliar. La impresión incluye todo el contenido.

## Presentación de la asignatura

[Introducción al curso](https://grupo-gemis.github.io/blockchain-curso-2026/introduccion.html): qué se aprende en las diez unidades, por qué se estudia cada tema y cómo se conecta con los demás. Incluye el mapa del recorrido, el caso de certificados y las vistas de lectura y presentación.

## Material por unidad

El contenido se consulta por unidades. El docente indica cuáles se trabajan en cada encuentro.

- [Unidad 01 · Fundamentos de blockchain](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-01.html)
- [Unidad 02 · Ecosistemas y wallets](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-02.html)
- [Unidad 03 · Programación en Solidity](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-03.html)
- [Unidad 04 · Entorno local de desarrollo](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-04.html)
- [Unidad 05 · Desarrollo de una DApp](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-05.html)
- [Unidad 06 · Gas y costo de deployment](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-06.html)
- [Unidad 07 · Deployment en una testnet](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-07.html)
- [Unidad 08 · Tokens y white paper](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-08.html)
- [Unidad 09 · Seguridad en Solidity](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-09.html)
- [Unidad 10 · Costo por usuario y operación](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-10.html)

## Laboratorios autónomos

Los [enunciados](laboratorios/) explican preparación, trabajo, evidencia y comprobaciones. Las [actividades de aplicación](actividades/) se relacionan con los cuestionarios del aula virtual.

```sh
git clone https://github.com/Grupo-Gemis/blockchain-curso-2026.git
cd blockchain-curso-2026/laboratorio
npm ci
npm run verificar
```

El [README del laboratorio](laboratorio/README.md) explica la secuencia de implementación y las pruebas. Los cuestionarios se completan en [Moodle](https://aulasvirtuales.frba.utn.edu.ar/course/view.php?id=29399).

## Recorrido sin costo adicional

Todos los laboratorios obligatorios se completan localmente con herramientas gratuitas. No hace falta comprar criptomonedas, una wallet física, licencias ni servicios RPC. Las plantillas pueden resolverse en LibreOffice Calc o Google Sheets. Sepolia es una extensión opcional y su disponibilidad no condiciona la evaluación.

La unidad 07 agrega `npm run verificar:deployment`, que comprueba la instancia local y guarda un informe de datos públicos. El README del laboratorio describe los comandos y la preparación.

## Edición de los materiales

Los documentos publicados están en `docs`. Cada HTML contiene texto, imágenes, estilos y navegación para poder consultarse completo. Las correcciones se realizan en las fuentes de autoría del curso y se regeneran los documentos.

Los archivos `unidad-XX.html` son la entrada principal. Las unidades 02 y 03 generan lectura y presentación desde los mismos bloques de contenido. `encuentro-02.html` conserva un acceso a esas unidades para los enlaces anteriores del aula.

## Estructura

- `docs`: HTML para lectura, presentación e impresión.
- `laboratorios`: enunciados y plantillas de costos.
- `actividades`: casos de aplicación.
- `laboratorio`: código inicial, scripts y pruebas.

Las plantillas CSV se abren en Google Sheets, LibreOffice o Excel. Las filas de resultado se completan con fórmulas a partir del enunciado.
