export const DEFAULT_WAIT = 10000

export function requestTimeout(value = DEFAULT_WAIT) {
  if (!Number.isInteger(value) || value < 1000 || value > 60000) throw Error('La espera debe ser un entero entre 1000 y 60000 milisegundos.')
  return value
}
