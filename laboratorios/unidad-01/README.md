# Unidad 01 · Entorno verificado y cadena de hashes

La práctica conserva la instalación del entorno del aula y agrega dos verificaciones observables. El programa de hashes es una simulación didáctica, no una implementación de una red blockchain.

## Preparación

Node.js instalado. Los scripts de esta unidad usan módulos incluidos en Node.js.

Los comandos se ejecutan desde la carpeta `laboratorio` del repositorio.

```sh
npm run verificar
npm run cadena
```

## Trabajo autónomo

1. Instalá una versión compatible de Node.js siguiendo su sitio oficial. Abrí una terminal nueva y registrá node --version y npm --version.
2. Abrí la carpeta laboratorio. Ejecutá node scripts/verificar-entorno.mjs y distinguí cada comprobación de sus recomendaciones.
3. Ejecutá node scripts/cadena.mjs. Guardá la salida inicial y la salida posterior a la alteración.
4. Leé el recálculo final de la cadena. Explicá por qué su consistencia interna no demuestra que una red la aceptaría.
5. Identificá qué función cumplen Node.js, npm y Hardhat. Relacioná cada uno con un comando del README.

## Evidencia

Un archivo entorno.txt con las versiones, la salida del verificador y una explicación de 150 a 200 palabras sobre alteración, recálculo y consenso.

## Criterios de comprobación

- Las versiones aparecen y el verificador no informa incompatibilidad.
- La alteración se detecta antes de recalcular.
- La explicación separa integridad local y acuerdo distribuido.

## Extensión

Modificá un espacio en los datos y repetí la comparación. Probá también un ejemplo en el que blockchain no resulte necesaria.

## Material relacionado

- [Apunte de la unidad](https://grupo-gemis.github.io/blockchain-curso-2026/unidad-01.html)
- [Actividad de aplicación](../../actividades/unidad-01.md)
- [Preparación del laboratorio](../../laboratorio/README.md)
