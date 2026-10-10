// Pruebas del reparto de productos en páginas. No tocan la red.
// Correr con:  npm test
import { paginarSecciones, nombreDePagina } from '../src/lib/paginar.js';

let fallos = 0;
const ok = (cond, nombre, extra = '') => {
  console.log((cond ? 'OK   ' : 'FALLO') + '  ' + nombre + (cond ? '' : '  -> ' + extra));
  if (!cond) fallos++;
};

/** Sección de prueba con n productos numerados. */
const sec = (titulo, n) => ({
  titulo,
  subtitulo: 'sub de ' + titulo,
  productos: Array.from({ length: n }, (_, i) => ({ nombre: `${titulo} ${i + 1}` })),
});

/** Cuántos productos quedó en cada página. */
const reparto = (paginas) => paginas.map(p => p.productos.length).join(',');

// --- Caso base: cabe en una página ---
let p = paginarSecciones([sec('A', 4)], 6);
ok(p.length === 1, 'cabe en una página');
ok(p[0].totalPartes === 1, 'totalPartes = 1');
ok(p[0].subtitulo === 'sub de A', 'conserva el subtítulo');

// --- Justo en el límite ---
ok(reparto(paginarSecciones([sec('A', 6)], 6)) === '6', 'exactamente 6 -> una página');

// --- El caso que motivó todo: 7 con máximo 6 ---
p = paginarSecciones([sec('A', 7)], 6);
ok(reparto(p) === '4,3', '7 productos -> 4,3 (no 6,1)', reparto(p));

// --- Los 11 combos reales de Zahara ---
p = paginarSecciones([sec('Desayunos', 11)], 6);
ok(reparto(p) === '6,5', '11 productos -> 6,5', reparto(p));
ok(p[0].parte === 1 && p[1].parte === 2, 'numera las partes');
ok(p.every(x => x.totalPartes === 2), 'todas saben que son 2');
ok(p[0].titulo === 'Desayunos' && p[1].titulo === 'Desayunos', 'repite el título');
ok(p[1].subtitulo === '', 'el subtítulo NO se repite en la parte 2');

// --- Tres páginas, reparto parejo ---
ok(reparto(paginarSecciones([sec('A', 13)], 6)) === '5,4,4', '13 -> 5,4,4');
ok(reparto(paginarSecciones([sec('A', 14)], 6)) === '5,5,4', '14 -> 5,5,4');
ok(reparto(paginarSecciones([sec('A', 20)], 6)) === '5,5,5,5', '20 -> 5,5,5,5');

// --- Nunca deja una página con menos de la mitad del resto ---
for (let n = 1; n <= 40; n++) {
  const r = paginarSecciones([sec('A', n)], 6).map(x => x.productos.length);
  const difMax = Math.max(...r) - Math.min(...r);
  if (difMax > 1) { ok(false, `reparto parejo con ${n} productos`, r.join(',')); break; }
  if (r.reduce((a, b) => a + b, 0) !== n) { ok(false, `no se pierde ningún producto con ${n}`); break; }
  if (Math.max(...r) > 6) { ok(false, `nunca pasa de 6 con ${n}`, r.join(',')); break; }
  if (n === 40) ok(true, 'de 1 a 40 productos: reparto parejo, sin pérdidas, nunca más de 6');
}

// --- Varias secciones ---
p = paginarSecciones([sec('Panadería', 3), sec('Desayunos', 11), sec('Bebidas', 1)], 6);
ok(p.length === 4, 'varias secciones -> 1 + 2 + 1 páginas', String(p.length));
ok(p.map(x => x.titulo).join('|') === 'Panadería|Desayunos|Desayunos|Bebidas', 'conserva el orden');

// --- Casos límite ---
ok(paginarSecciones([], 6).length === 0, 'sin secciones -> sin páginas');
ok(paginarSecciones([{ titulo: 'Vacía', productos: [] }], 6).length === 0,
   'una sección sin productos no genera página');
ok(paginarSecciones(null, 6).length === 0, 'null no revienta');
ok(reparto(paginarSecciones([sec('A', 5)], 0)) === '5', 'máximo 0 -> usa el valor por defecto');
ok(reparto(paginarSecciones([sec('A', 10)], 1)) === '1,1,1,1,1,1,1,1,1,1', 'máximo 1');

// --- Nombres de página ---
p = paginarSecciones([sec('Desayunos', 11)], 6);
ok(nombreDePagina(p[0]) === 'Desayunos (1/2)', 'nombre con parte', nombreDePagina(p[0]));
ok(nombreDePagina(paginarSecciones([sec('Bebidas', 2)], 6)[0]) === 'Bebidas',
   'sin parte cuando es una sola página');

// --- El número es el de la SECCIÓN, no el de la página ---
p = paginarSecciones([sec('Panadería', 3), sec('Desayunos', 11), sec('Bebidas', 2)], 6);
ok(p.map(x => x.numeroSeccion).join(',') === '1,2,2,3',
   'numeroSeccion: las dos partes de Desayunos son ambas la 2',
   p.map(x => x.numeroSeccion).join(','));

// --- Máximo distinto por sección (tabla compacta de bebidas) ---
const limitePorTitulo = (s) => (s.titulo === 'Bebidas' ? 12 : 6);
ok(reparto(paginarSecciones([sec('Desayunos', 11), sec('Bebidas', 12)], limitePorTitulo)) === '6,5,12',
   'en la tabla compacta caben más por página',
   reparto(paginarSecciones([sec('Desayunos', 11), sec('Bebidas', 12)], limitePorTitulo)));
ok(reparto(paginarSecciones([sec('Bebidas', 13)], limitePorTitulo)) === '7,6',
   '13 bebidas con máximo 12 -> 7,6 (parejo)',
   reparto(paginarSecciones([sec('Bebidas', 13)], limitePorTitulo)));
ok(reparto(paginarSecciones([sec('A', 10)], () => undefined)) === '5,5',
   'función que devuelve basura -> valor por defecto (6), repartido parejo 5,5',
   reparto(paginarSecciones([sec('A', 10)], () => undefined)));

// --- La marca de sección compacta viaja a la página ---
const conMarca = [{ titulo: 'Bebidas', compacta: true, productos: sec('B', 3).productos }];
ok(paginarSecciones(conMarca, 12)[0].compacta === true, 'conserva compacta: true');
ok(paginarSecciones([sec('Desayunos', 3)], 6)[0].compacta === false, 'compacta: false por defecto');

console.log(fallos ? `\n${fallos} FALLOS` : '\n*** TODAS LAS PRUEBAS PASAN ***');
process.exit(fallos ? 1 : 0);
