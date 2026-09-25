# Blockchain & Smart Contracts · UTN FRBA · 2026

[Abrir los materiales del curso](https://grupo-gemis.github.io/blockchain-curso-2026/)

Los HTML integran teoría, ejemplos, gráficos y actividades. Cada archivo incluye sus imágenes y su navegación. **Lectura** muestra el documento completo. **Presentación** permite avanzar por secciones con botones o flechas del teclado. Los gráficos se pueden ampliar. La impresión incluye todo el contenido.

## Encuentros

| Encuentro | Unidades | Material |
|---|---|---|
| 1 | 1 | [HTML](https://grupo-gemis.github.io/blockchain-curso-2026/encuentro-01.html) |
| 2 | 2 y 3 | [HTML](https://grupo-gemis.github.io/blockchain-curso-2026/encuentro-02.html) |
| 3 | 4 y 5 | [HTML](https://grupo-gemis.github.io/blockchain-curso-2026/encuentro-03.html) |
| 4 | 6 y 7 | [HTML](https://grupo-gemis.github.io/blockchain-curso-2026/encuentro-04.html) |
| 5 | 8 | [HTML](https://grupo-gemis.github.io/blockchain-curso-2026/encuentro-05.html) |
| 6 | 9 y 10 | [HTML](https://grupo-gemis.github.io/blockchain-curso-2026/encuentro-06.html) |
| 7 | Integración y consultas | [HTML](https://grupo-gemis.github.io/blockchain-curso-2026/encuentro-07.html) |

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

Los documentos están en `docs`. Cada HTML puede editarse con un editor de texto sin instalar herramientas. El contenido se organiza en elementos `section`, con un título y párrafos. CSS y JavaScript están incluidos al comienzo y al final del archivo.

Los archivos `unidad-XX.html` permiten consultar una unidad. Los archivos `encuentro-XX.html` reúnen las unidades correspondientes. Cuando una corrección afecta a ambos, deben mantenerse sincronizados. La generación institucional conserva una fuente común para producir las dos vistas.

## Estructura

- `docs`: HTML para lectura, presentación e impresión.
- `laboratorios`: enunciados y plantillas de costos.
- `actividades`: casos de aplicación.
- `laboratorio`: código inicial, scripts y pruebas.

Las plantillas CSV se abren en Google Sheets, LibreOffice o Excel. Las filas de resultado se completan con fórmulas a partir del enunciado.
