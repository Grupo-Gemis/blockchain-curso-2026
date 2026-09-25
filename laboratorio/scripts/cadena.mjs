import {createHash} from 'node:crypto';
const hash=b=>createHash('sha256').update(JSON.stringify([b.indice,b.dato,b.anterior])).digest('hex');
const cadena=[];
for(let i=0;i<3;i++){const b={indice:i,dato:`Mensaje ${i}`,anterior:i?cadena[i-1].hash:'0'};b.hash=hash(b);cadena.push(b);}
function valida(){return cadena.every((b,i)=>b.hash===hash(b)&&b.anterior===(i?cadena[i-1].hash:'0'));}
console.log('Cadena inicial válida:',valida());
cadena[0].dato='Mensaje alterado'; console.log('Tras alterar el primer dato:',valida());
for(let i=0;i<cadena.length;i++){cadena[i].anterior=i?cadena[i-1].hash:'0';cadena[i].hash=hash(cadena[i]);}
console.log('Tras recalcular toda la cadena:',valida());
console.log('Simulación de enlaces hash. No implementa consenso ni demuestra inmutabilidad por sí sola.');
