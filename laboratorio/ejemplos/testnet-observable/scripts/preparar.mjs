import {dependencias, npm} from './entorno.mjs'
try {
  await dependencias()
  await npm(['run', 'compilar'])
  await npm(['test'])
  console.log('\nLaboratorio preparado y pruebas aprobadas. Ejecutá npm start.')
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
