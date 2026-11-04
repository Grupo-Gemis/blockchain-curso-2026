# AULA: créditos para talleres

Documento ilustrativo, versión 0.2. Prototipo de referencia para el seminario. Las cantidades y el servicio son ficticios.

## Problema y participantes

Una cooperativa y varios prestadores proponen reconocer créditos comunes para solicitar plazas en talleres. Actualmente necesitan conciliar registros separados y acordar qué créditos aceptan. El objetivo es disponer de reglas y saldos que las partes puedan comprobar.

La cooperativa coordinaría la asignación inicial y las condiciones del servicio. Las personas utilizarían los créditos y los prestadores reconocerían las reservas. La decisión de emplear blockchain debe evaluarse frente a una base de datos administrada por una de las organizaciones. Si esa administración resulta aceptable para todos, podría resolver la necesidad con menor complejidad.

## Uso y arquitectura propuestos

AULA representa cantidades equivalentes de créditos. Cada plaza costaría 10 AULA y cada taller tendría 12 plazas, supuestos de este caso. No se fija precio de mercado ni se promete rentabilidad.

TokenAula conserva saldos, oferta y permisos. Una aplicación de reservas debería identificar al solicitante, comprobar cupo y relacionar el cobro con la plaza. Los datos personales se conservarían fuera de la cadena bajo una política definida. La prestación del taller requiere una organización responsable.

## Token e implementación disponible

El contrato de referencia utiliza Solidity 0.8.28 y OpenZeppelin Contracts 5.4.0. Su nombre es Token Aula y su símbolo AULA. Emite una oferta inicial de 1.000.000 AULA con 18 decimales, equivalente a 10²⁴ unidades mínimas. El constructor entrega toda la emisión al receptor elegido. No incorpora emisión pública posterior, quema pública, pausa ni administración Ownable.

La identidad de una instancia incluye su red y dirección de contrato. El símbolo puede repetirse. ETH se utiliza para pagar gas en el entorno Ethereum del ejemplo. Los AULA y el ETH tienen balances y funciones distintas.

## Asignación y reparto

| Destino | Porcentaje | AULA | Mecanismo del ensayo |
|---|---:|---:|---|
| Incentivos | 50% | 500.000 | Transferencia desde la receptora inicial |
| Comunidad | 20% | 200.000 | Transferencia desde la receptora inicial |
| Reserva | 20% | 200.000 | Transferencia desde la receptora inicial |
| Equipo | 10% | 100.000 | Depósito en VestingAula |

El ensayo independiente `npm run distribucion` utiliza a Bruno como creador y a Ana como receptora. Bruno paga la creación. Ana realiza cuatro transferencias y queda sin AULA después del reparto. Cada operación tiene su recibo y comisión. La oferta permanece en un millón.

El código del token por sí solo no realiza estas cuatro operaciones. La evidencia del reparto corresponde al ensayo que las ejecuta. El script no distribuye fondos reales ni usa una red pública.

## Vesting del equipo

La asignación del equipo se deposita en VestingAula antes del inicio. El contrato hereda VestingWallet de OpenZeppelin 5.4.0. Se eligen beneficiario, instante inicial y duración de 360 días, sin cliff adicional.

El calendario habilita cantidades de forma lineal. Al día 90 el acumulado habilitado es 25.000 AULA. Al 180 es 50.000 y al 360 es 100.000. La cantidad disponible se calcula restando lo ya retirado. Si se retiraron 25.000 en el día 90, en el día 180 se pueden liberar otros 25.000.

Una cuenta inicia release y paga gas. El beneficiario recibe lo habilitado. El transcurso del tiempo no envía por sí mismo esa operación. En esta implementación puede cambiarse la titularidad del vesting. Los depósitos posteriores al inicio siguen el mismo calendario y podrían quedar parcialmente habilitados de inmediato. El ensayo evita ese caso al financiar antes del inicio.

## Estado y evidencia

| Afirmación | Estado en el prototipo de referencia | Comprobación |
|---|---|---|
| Emisión, transferencias y permisos | Implementados en TokenAula | Código, recibos, balances, oferta y allowance |
| Reparto 50/20/20/10 | Implementado en el ensayo independiente | Cuatro transferencias y balances finales |
| Vesting del equipo | Implementado en el ensayo independiente | Contrato financiado y retiros en cortes temporales |
| Reserva de plazas y devolución por cancelación | Propuesto | Faltan aplicación, reglas e integración |
| Taller efectivamente dictado | Depende de un actor externo | Prestador responsable y evidencia del servicio |

Este documento no declara una instancia pública operativa. El ensayo produce `resultados/distribucion-vesting.json`, con identidad de red local, cuentas, contratos, recibos y estados. Cada equipo debe adjuntar su propia ejecución y distinguirla del ejemplo resuelto. El nodo temporal se cierra al terminar.

## Riesgos, responsabilidades y etapas

La pérdida de una clave puede impedir gestionar un saldo. La cooperativa debe definir su política de atención. Una aprobación a un contrato equivocado puede habilitar gasto no deseado, por lo que la interfaz debe mostrar token, red, dirección y límite. La reserva concentrada en una cuenta requiere explicar quién controla esa clave.

Una cancelación de taller exige definir quién acredita el hecho, quién autoriza la devolución y cómo se registra. El token no comprueba por sí solo esa condición externa.

La etapa disponible estudia token, reparto y vesting local. Una etapa siguiente especificaría y probaría reservas, cupos, cancelaciones y devoluciones. Cada etapa debe producir resultados comprobables antes de anunciar esas capacidades como disponibles.
