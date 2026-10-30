import {dependencias,npm} from './entorno.mjs'
await dependencias()
await npm(['run','compilar'])
await npm(['test'])
console.log('Preparación y pruebas completadas. Ejecutá npm start y abrí http://127.0.0.1:4388.')
