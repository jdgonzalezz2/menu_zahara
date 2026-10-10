// Pruebas de la combinación Sheet + respaldo. No tocan la red.
import { combinarSecciones } from '../src/lib/combinar.js';

let fallos = 0;
const ok = (cond, nombre, extra = '') => {
  console.log((cond ? 'OK   ' : 'FALLO') + '  ' + nombre + (cond ? '' : '  -> ' + extra));
  if (!cond) fallos++;
};

const sec = (titulo, n, marca = 'x') => ({
  titulo,
  productos: Array.from({ length: n }, (_, i) => ({ nombre: `${marca}${i + 1}` })),
});

const titulos = (r) => r.map(s => s.titulo).join('|');
const origenes = (r) => r.map(s => s.origen).join('|');

const respaldo = [sec('Desayunos', 11, 'r'), sec('Panadería', 12, 'r'),
                  sec('Bebidas calientes', 13, 'r'), sec('Adicionales', 6, 'r')];

// --- El caso real de hoy: el Sheet solo tiene Desayunos ---
let r = combinarSecciones([sec('Desayunos', 11, 's')], respaldo);
ok(r.length === 4, 'la carta sale completa', String(r.length));
ok(titulos(r) === 'Desayunos|Panadería|Bebidas calientes|Adicionales', 'orden del respaldo', titulos(r));
ok(origenes(r) === 'sheet|respaldo|respaldo|respaldo', 'Desayunos viene del Sheet', origenes(r));
ok(r[0].productos[0].nombre === 's1', 'los productos de Desayunos son los del Sheet');

// --- El Sheet MANDA, aunque tenga menos productos ---
r = combinarSecciones([sec('Desayunos', 2, 's')], respaldo);
ok(r[0].productos.length === 2, 'si el Sheet tiene 2, salen 2 (no se mezclan)', String(r[0].productos.length));

// --- Cuando el Sheet ya tiene todo, el respaldo no aporta nada ---
r = combinarSecciones(respaldo.map(s => sec(s.titulo, 3, 's')), respaldo);
ok(origenes(r) === 'sheet|sheet|sheet|sheet', 'todo del Sheet', origenes(r));

// --- Tildes y mayúsculas no deben duplicar secciones ---
r = combinarSecciones([sec('PANADERIA', 4, 's')], respaldo);
ok(r.length === 4, 'PANADERIA == Panadería, no se duplica', String(r.length));
ok(r[1].origen === 'sheet' && r[1].productos.length === 4, 'y gana la del Sheet');

// --- Secciones que solo existen en el Sheet van al final ---
r = combinarSecciones([sec('Desayunos', 1, 's'), sec('Pizzería', 5, 's')], respaldo);
ok(titulos(r) === 'Desayunos|Panadería|Bebidas calientes|Adicionales|Pizzería',
   'la sección nueva del Sheet se agrega al final', titulos(r));

// --- Casos límite ---
ok(combinarSecciones([], respaldo).length === 4, 'Sheet vacío -> todo el respaldo');
ok(combinarSecciones(respaldo, []).length === 4, 'respaldo vacío -> todo el Sheet');
ok(combinarSecciones(null, null).length === 0, 'null no revienta');
ok(combinarSecciones([sec('Desayunos',1,'a'), sec('Desayunos',9,'b')], respaldo)[0].productos.length === 1,
   'sección repetida en el Sheet -> se queda la primera');

console.log(fallos ? `\n${fallos} FALLOS` : '\n*** TODAS LAS PRUEBAS PASAN ***');
process.exit(fallos ? 1 : 0);
