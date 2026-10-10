// Pruebas de la construcción de rutas. Este bug ya se escapó una vez:
// BASE_URL venía sin barra final y salía "/menu_zaharaassets/foto.webp".
import { rutaDeAsset } from '../src/lib/rutas.js';

let fallos = 0;
const ok = (a, b, nombre) => {
  const bien = a === b;
  console.log((bien ? 'OK   ' : 'FALLO') + '  ' + nombre + (bien ? '' : `  -> "${a}" != "${b}"`));
  if (!bien) fallos++;
};

ok(rutaDeAsset('/menu_zahara', 'f.webp'),  '/menu_zahara/assets/f.webp', 'base sin barra final');
ok(rutaDeAsset('/menu_zahara/', 'f.webp'), '/menu_zahara/assets/f.webp', 'base con barra final');
ok(rutaDeAsset('/', 'f.webp'),             '/assets/f.webp',             'base raíz');
ok(rutaDeAsset('', 'f.webp'),              '/assets/f.webp',             'base vacía');
ok(rutaDeAsset(undefined, 'f.webp'),       '/assets/f.webp',             'base undefined');
ok(rutaDeAsset('/menu_zahara', '/f.webp'), '/menu_zahara/assets/f.webp', 'archivo con barra inicial');
ok(rutaDeAsset('/a/b/', 'f.webp'),         '/a/b/assets/f.webp',         'base con subcarpetas');
ok(rutaDeAsset('/menu_zahara//', 'f.webp'),'/menu_zahara/assets/f.webp', 'base con barras de más');

console.log(fallos ? `\n${fallos} FALLOS` : '\n*** TODAS LAS PRUEBAS PASAN ***');
process.exit(fallos ? 1 : 0);
