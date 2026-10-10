// El catálogo manda; el Sheet solo pone precios y agotados.
import { aplicarPreciosDelSheet } from '../src/lib/precios.js';

let fallos = 0;
const ok = (cond, nombre, extra = '') => {
  console.log((cond ? 'OK   ' : 'FALLO') + '  ' + nombre + (cond ? '' : '  -> ' + extra));
  if (!cond) fallos++;
};

const catalogo = [
  { titulo: 'Desayunos', productos: [
      { nombre: 'Combo 1', precio: 11000, desc: 'Huevos.', etiqueta: '' },
      { nombre: 'Combo 2', precio: 13300, desc: 'Tamal.', etiqueta: '' } ] },
  { titulo: 'Bebidas calientes', productos: [
      { nombre: 'Tinto', precio: 2500, desc: '', etiqueta: '' } ] },
];
const prod = (r, s, i) => r.paginas[s].productos[i];

// --- El Sheet cambia el precio ---
let r = aplicarPreciosDelSheet(catalogo, [{ titulo: 'X', productos: [{ nombre: 'Combo 1', precio: 12500 }] }]);
ok(prod(r,0,0).precio === 12500, 'el Sheet manda el precio', String(prod(r,0,0).precio));
ok(prod(r,0,0).desc === 'Huevos.', 'la descripción sigue siendo la del catálogo');
ok(prod(r,0,1).precio === 13300, 'lo que el Sheet no menciona no cambia');
ok(r.aplicados === 1, 'cuenta los aplicados');

// --- El Sheet marca agotado ---
r = aplicarPreciosDelSheet(catalogo, [{ titulo: 'X', productos: [{ nombre: 'Tinto', precio: 2500, etiqueta: 'agotado' }] }]);
ok(prod(r,1,0).etiqueta === 'agotado', 'el Sheet marca agotado');

// --- LO IMPORTANTE: una fila nueva en el Sheet NO agrega producto ---
r = aplicarPreciosDelSheet(catalogo, [{ titulo: 'Inventada', productos: [
  { nombre: 'Producto que no existe', precio: 9000 }, { nombre: 'Combo 1', precio: 11500 } ] }]);
ok(r.paginas.length === 2, 'no se crean secciones nuevas', String(r.paginas.length));
ok(r.paginas[0].productos.length === 2, 'no se crean productos nuevos');
ok(r.ignorados.length === 1 && r.ignorados[0] === 'Producto que no existe',
   'avisa qué filas del Sheet se ignoraron', JSON.stringify(r.ignorados));

// --- Tolerancia en los nombres ---
r = aplicarPreciosDelSheet(catalogo, [{ titulo:'X', productos:[{ nombre:'  COMBO 1 ', precio: 1 }] }]);
ok(prod(r,0,0).precio === 1, 'mayúsculas y espacios no rompen el enlace');
r = aplicarPreciosDelSheet(
  [{ titulo:'B', productos:[{ nombre:'Aromática', precio: 3800 }] }],
  [{ titulo:'X', productos:[{ nombre:'aromatica', precio: 4000 }] }]);
ok(r.paginas[0].productos[0].precio === 4000, 'las tildes tampoco');

// --- Un precio ilegible NO borra el del catálogo ---
r = aplicarPreciosDelSheet(catalogo, [{ titulo:'X', productos:[{ nombre:'Combo 1', precio: null }] }]);
ok(prod(r,0,0).precio === 11000, 'precio nulo -> se queda el del catálogo', String(prod(r,0,0).precio));
r = aplicarPreciosDelSheet(catalogo, [{ titulo:'X', productos:[{ nombre:'Combo 1', precio: NaN }] }]);
ok(prod(r,0,0).precio === 11000, 'precio NaN -> se queda el del catálogo');

// --- No se muta el catálogo original ---
aplicarPreciosDelSheet(catalogo, [{ titulo:'X', productos:[{ nombre:'Combo 1', precio: 99 }] }]);
ok(catalogo[0].productos[0].precio === 11000, 'el catálogo original queda intacto');

// --- Casos límite ---
ok(aplicarPreciosDelSheet(catalogo, []).paginas.length === 2, 'Sheet vacío -> catálogo tal cual');
ok(aplicarPreciosDelSheet(catalogo, []).paginas[0].productos[0].precio === 11000, 'y con sus precios');
ok(aplicarPreciosDelSheet(null, null).paginas.length === 0, 'null no revienta');
r = aplicarPreciosDelSheet(catalogo, [{ titulo:'X', productos:[
  { nombre:'Combo 1', precio: 1 }, { nombre:'Combo 1', precio: 2 } ] }]);
ok(prod(r,0,0).precio === 1, 'nombre repetido en el Sheet -> manda la primera fila');

console.log(fallos ? `\n${fallos} FALLOS` : '\n*** TODAS LAS PRUEBAS PASAN ***');
process.exit(fallos ? 1 : 0);
