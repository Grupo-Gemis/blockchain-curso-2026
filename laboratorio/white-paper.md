# White paper · propuesta de laboratorio

Presentar de dos a cuatro páginas, sin contar el anexo de evidencia. Identificar cada regla como **implementada**, **propuesta** o **dependiente de un actor externo**. No hace falta inventar datos, precio de mercado ni una oferta de inversión. Usar PENDIENTE cuando falte definir o comprobar algo.

## 1. Problema y usuarios

Describir una necesidad concreta, quién la tiene y qué evidencia se conoce. Explicar qué aporta una cadena frente a una base de datos y qué parte del problema no resuelve un token.

## 2. Arquitectura, red y datos

Identificar interfaz, contrato, red y actores que verifican. Señalar dónde quedan los datos externos y quién los comprueba. Relacionar red, dirección del contrato y cuentas. No publicar datos personales innecesarios.

## 3. Utilidad, token y oferta

Nombre, símbolo, estándar, utilidad, totalSupply y decimals. TokenAula implementa una emisión fija de 1.000.000 AULA al receptor inicial, equivalente a 10^24 unidades mínimas. No tiene emisión pública posterior, pausa, quema pública ni administración por propietario. Describir cómo se comprobó cada afirmación.

Indicar qué acción del servicio permitiría AULA y qué mecanismo aún falta. Tener AULA no reemplaza al ETH necesario para pagar gas en este entorno. La oferta limitada no garantiza demanda, precio ni liquidez.

## 4. Distribución propuesta

| Destino | Porcentaje | AULA | Estado del caso base |
|---|---:|---:|---|
| Incentivos de uso | 50% | 500000 | Propuesto |
| Comunidad | 20% | 200000 | Propuesto |
| Reserva | 20% | 200000 | Propuesto |
| Equipo | 10% | 100000 | Propuesto |

La suma debe ser 100% y las cantidades deben sumar la oferta. El constructor entrega todo a una cuenta. Los porcentajes no distribuyen por sí solos los tokens. Si se implementó otra distribución, adjuntar operaciones y balances en vez de afirmar que la tabla basta.

## 5. Calendario y autoridades

Si se propone vesting, definir beneficiario, asignación, inicio, duración, retiros previos y condición temporal. Indicar qué contrato conservaría las unidades y cómo se financiaría. No afirmar que el calendario está implementado en TokenAula.

Distinguir creador, receptor inicial, tenedores, spender, responsables del servicio y validadores de la red. Explicar qué puede decidir cada uno, qué no puede cambiar y qué regla adicional requeriría la propuesta.

## 6. Afirmaciones y evidencia

| Afirmación concreta | Estado | Evidencia o comprobación pendiente |
|---|---|---|
| Emisión de 1.000.000 AULA al receptor | Implementado en el ejemplo | Completar red, instancia, recibo y lectura de oferta. |
| Autorización finita de gasto | Implementado en el ejemplo | Completar owner, spender, destino, permiso antes y después. |
| Reparto 50/20/20/10 | Propuesto | Faltan operaciones o mecanismos de reparto. |
| Calendario del equipo | Propuesto | Definir mecanismo, financiación y pruebas temporales. |
| Uso en un servicio real | Propuesto o dependiente de un actor externo | Identificar responsable, integración y condición de cumplimiento. |

## 7. Riesgos y etapas

Elegir al menos dos fallos concretos. Para cada uno, describir causa, consecuencia, responsable y mitigación o límite. Considerar autorización a un spender equivocado, falta de ETH, pérdida de clave, interrupción del servicio o concentración de decisiones.

El roadmap identifica resultados comprobables para problema, prototipo, pruebas, revisión y operación. No confundir un prototipo local con un despliegue o una oferta pública.

## 8. Pruebas y límites

Registrar emisión, transferencia, permiso, uso por un tercero, revocación y conservación de oferta. Distinguir rechazo previo al envío de reversión incluida y señalar quién paga gas. Adjuntar observaciones identificadas por red, instancia y bloque.

Separar pruebas aprobadas, interpretaciones y pendientes. ERC20 no califica el documento ni demuestra la viabilidad económica del servicio.

## 9. Revisión de otro equipo

Registrar dos observaciones con la frase revisada, su evidencia, una corrección propuesta y la respuesta del autor. Explicar qué se cambió o por qué se conservó.
