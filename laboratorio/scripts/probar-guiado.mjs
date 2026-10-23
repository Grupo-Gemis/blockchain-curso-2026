// La copia guiada solo comprueba los objetivos de 04 y 05.
process.env.LAB_TEST_PATTERN = 'Contador|Interfaz|Deployment';
await import('./probar.mjs');
