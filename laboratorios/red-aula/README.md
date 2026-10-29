# Participar de una blockchain con distintos cursos

La [guía completa y el programa](../../laboratorio/ejemplos/red-aula/README.md) permiten configurar de 2 a 60 participantes. Cada ciclo de N turnos asigna una propuesta por identidad y el quórum se calcula como `floor(2 × N / 3) + 1`. Diez sigue siendo el ejemplo inicial.

La modalidad coordinada requiere Node.js 24 en una computadora y navegadores para el resto. Su caída interrumpe el intercambio. La [modalidad de nodos independientes](../../laboratorio/ejemplos/red-aula/NODOS-INDEPENDIENTES.md) requiere Node.js 24 por estudiante. Los programas se comunican directamente, conservan sus datos y avanzan mediante decisiones certificadas por el grupo.

El tutorial entre pares explica invitaciones, configuración común, propuesta, comprobación, quórum, caída, recuperación y evidencia. La simulación tiene reglas didácticas explícitas y no ejecuta Ethereum PoS. El Contador se conserva para operar como usuario de una red EVM.
