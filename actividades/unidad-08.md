# Unidad 08 · El documento y el contrato no coinciden

El white paper dice emisión fija de 1.000.000 AULA, 18 decimales y distribución 50/20/20/10. El constructor entrega toda la emisión al receptor. Un revisor afirma que el vesting ya está garantizado por esos porcentajes.

1. Comprobar oferta, unidades y distribución.
2. Explicar el efecto de transferir 10 AULA.
3. Evaluar si la distribución y el vesting están implementados.

## Contrastar la afirmación con una operación

En una instancia independiente, Ana recibe 1.000.000 AULA. Transfiere 10 a Bruno, autoriza a Bruno por 3 y Bruno usa 2 desde Ana hacia Carla.

4. Construí una tabla de saldos y permiso antes y después de esas llamadas. Identificá quién firma, quién paga ETH y quién recibe AULA.
5. Con permiso restante 1, explicá la diferencia entre estimar otros 2 sin enviarlos y enviar una transacción que termina con status 0. ¿Qué cambia en tokens, permiso, ETH y nonce?
6. Si Ana revoca a cero, ¿recupera los 2 AULA que recibió Carla? Justificá con el alcance de approve.
7. Elegí una afirmación del documento y escribí qué evidencia la prueba o qué mecanismo falta.

Podés contrastar tus respuestas con el [laboratorio guiado](../laboratorio/ejemplos/token-observable/GUIA-08.md). Las situaciones del cuestionario son independientes y declaran sus propios datos.
