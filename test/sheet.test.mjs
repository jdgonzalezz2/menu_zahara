// Pruebas del parser de CSV y del armado del menú. No tocan la red.
// Correr con:  npm test
import { parsearCSV, filasAMenu, leerPrecio, urlDelSheet }
  from '../src/lib/sheet.js';

let fallos = 0;
const ok = (cond, nombre, extra = '') => {
  console.log((cond ? 'OK   ' : 'FALLO') + '  ' + nombre + (cond ? '' : '  -> ' + extra));
  if (!cond) fallos++;
};

// --- leerPrecio: lo que una persona real escribiría ---
ok(leerPrecio('2500') === 2500, 'precio "2500"');
ok(leerPrecio('2.500') === 2500, 'precio "2.500" (puntos de miles)');
ok(leerPrecio('$ 2.500') === 2500, 'precio "$ 2.500"');
ok(leerPrecio('2,500') === 2500, 'precio "2,500"');
ok(leerPrecio('  12000 ') === 12000, 'precio con espacios');
ok(leerPrecio(4500) === 4500, 'precio ya numérico');
ok(leerPrecio('') === null, 'precio vacío -> null');
ok(leerPrecio('gratis') === null, 'precio no numérico -> null');

// --- parsearCSV: el caso que rompe los parsers ingenuos ---
const csv = [
  'Seccion,Producto,Precio,Descripcion,Estado,Foto',
  'Panadería,Pandebono,2500,"Clásico, suave por dentro",,pandebono.webp',
  'Panadería,Roscón,4500,Con arequipe,nuevo,',
  'Desayunos,Tamal,10000,"Solo fines de semana",AGOTADO,',
  'Desayunos,"Caldo ""especial""",9000,Con costilla,,',
  ',,,,,',                                   // fila vacía: debe ignorarse
  'Bebidas,Tinto,2000,,,',
].join('\n');

const filas = parsearCSV(csv);
ok(filas.length === 6, 'filas no vacías', 'obtuvo ' + filas.length);
ok(filas[1][3] === 'Clásico, suave por dentro', 'coma dentro de comillas', filas[1][3]);
ok(filas[4][1] === 'Caldo "especial"', 'comillas escapadas', filas[4][1]);

// --- filasAMenu ---
const menu = filasAMenu(filas);
ok(menu.paginas.length === 3, '3 secciones', JSON.stringify(menu.paginas.map(p => p.titulo)));
ok(menu.paginas[0].titulo === 'Panadería', 'orden de aparición', menu.paginas[0].titulo);

const tamal = menu.paginas[1].productos.find(p => p.nombre === 'Tamal');
ok(tamal.etiqueta === 'agotado', 'AGOTADO en mayúsculas se normaliza', tamal.etiqueta);

const roscon = menu.paginas[0].productos.find(p => p.nombre === 'Roscón');
ok(roscon.etiqueta === 'nuevo', 'etiqueta nuevo');

const pandebono = menu.paginas[0].productos[0];
ok(pandebono.img === 'pandebono.webp', 'foto');
ok(pandebono.precio === 2500, 'precio parseado');

const tinto = menu.paginas[2].productos[0];
ok(tinto.desc === '', 'descripción vacía');
ok(!('img' in tinto), 'sin foto -> sin campo img');

// --- Encabezados con tildes/mayúsculas raras ---
const csv2 = 'SECCIÓN,PRODUCTO,PRECIO,DESCRIPCIÓN,ESTADO,FOTO\nPan,Mogolla,1800,Rica,,';
const menu2 = filasAMenu(parsearCSV(csv2));
ok(menu2.paginas[0].productos[0].nombre === 'Mogolla', 'encabezados con tildes y mayúsculas');

// --- Falta la columna Producto -> debe explotar con mensaje claro ---
try {
  filasAMenu(parsearCSV('Seccion,Precio\nPan,2000'));
  ok(false, 'sin columna Producto debe lanzar error');
} catch (e) {
  ok(/Producto/.test(e.message), 'error claro al faltar Producto', e.message);
}

// --- URL ---
ok(urlDelSheet('ABC123', 'Carta').includes('gviz/tq?tqx=out:csv'), 'usa gviz, no la API');
ok(urlDelSheet('ABC123', 'Carta').includes('&sheet=Carta'), 'con nombre de pestaña');
ok(!urlDelSheet('ABC123', '').includes('&sheet='), 'pestaña vacía -> primera pestaña');
ok(!urlDelSheet('ABC123', '   ').includes('&sheet='), 'pestaña en blanco -> primera pestaña');
ok(!urlDelSheet('ABC123').includes('&sheet='), 'sin pestaña -> primera pestaña');
ok(urlDelSheet('ABC123', 'plantilla-carta').includes('&sheet=plantilla-carta'), 'nombre con guión');
ok(urlDelSheet('ABC123', '', '1450287302').includes('&gid=1450287302'), 'gid');
ok(urlDelSheet('ABC123', 'Carta', '999').includes('&gid=999'), 'el gid manda sobre el nombre');
ok(!urlDelSheet('ABC123', 'Carta', '999').includes('&sheet='), 'con gid no se manda sheet');

console.log(fallos ? `\n${fallos} FALLOS` : '\n*** TODAS LAS PRUEBAS PASAN ***');
process.exit(fallos ? 1 : 0);
