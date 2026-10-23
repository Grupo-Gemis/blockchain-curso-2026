# Un certificado vigente cuyo archivo no se entrega

En una instancia conocida, Ana emitió la huella del documento original. El servidor del archivo devuelve HTTP 503. Bruno propone marcarlo como revocado porque no puede descargarlo. Otra persona presenta un archivo visualmente parecido cuya huella es distinta.

1. Separá qué sabemos del registro, qué sabemos del servicio externo y qué no podemos concluir del contenido.
2. Indicá qué consultarías para comprobar la vigencia y qué debería mostrar la interfaz si falla el nodo.
3. Predecí el resultado de que Bruno intente emitir la nueva huella o revocar la original.
4. Explicá por qué la identidad de la autoridad requiere un procedimiento externo al contrato.
5. Proponé una alternativa con una base de datos y documentos firmados. Compará las condiciones en que cada diseño tendría sentido.

Comprobá después tus predicciones con la [práctica integradora](../laboratorios/integracion-certificados/README.md). El caso utiliza datos ficticios. Una afirmación de vigencia debe identificar la red, la instancia y el momento de la consulta.
