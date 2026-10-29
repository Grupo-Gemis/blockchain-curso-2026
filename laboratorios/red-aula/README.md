# Participar de una blockchain con distintos cursos

La [guía completa y el programa](../../laboratorio/ejemplos/red-aula/README.md) permiten configurar de 2 a 60 participantes. Cada ciclo de N turnos asigna una propuesta por identidad y el quórum se calcula como `floor(2 × N / 3) + 1`. Diez sigue siendo el ejemplo inicial.

La modalidad coordinada requiere Node.js 24 en una computadora y navegadores para el resto. Su caída interrumpe el intercambio. La [modalidad de nodos independientes](../../laboratorio/ejemplos/red-aula/NODOS-INDEPENDIENTES.md) requiere Node.js 24 por estudiante. Los programas se comunican directamente, conservan sus datos y avanzan mediante decisiones certificadas por el grupo.

El tutorial entre pares explica invitaciones, configuración común, propuesta, comprobación, quórum, caída, recuperación y evidencia. La simulación tiene reglas didácticas explícitas y no ejecuta Ethereum PoS. El Contador se conserva para operar como usuario de una red EVM.

Para la cursada a distancia, cada estudiante conecta su computadora desde su casa mediante la [guía por Internet](../../laboratorio/ejemplos/red-aula/DESDE-CASA.md). No se requiere el mismo Wi-Fi. La VPN proporciona conectividad y los nodos conservan sus firmas, copias y decisiones.

La [modalidad de clientes reales](../../laboratorio/ejemplos/red-aula/real-besu/README.md) prepara Besu con Docker y consenso QBFT. Usa una computadora por nodo, admite de 4 a 60 y puede conectarse por Internet o por la LAN del laboratorio. Se comprobó una red de cuatro clientes reales. El piloto entre casas sigue pendiente. Incluye [criterios de aceptación](../../laboratorio/ejemplos/red-aula/real-besu/ACEPTACION.md) y [guía para incorporarse a una red pública](../../laboratorio/ejemplos/red-aula/NODO-PUBLICO.md).
