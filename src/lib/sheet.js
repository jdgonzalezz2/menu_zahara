/* ============================================================================
   LECTURA DEL GOOGLE SHEET

   Este archivo se usa en DOS momentos distintos:

   1. En el build (Node), para hornear los datos dentro de la carta.
   2. En el celular del cliente, para refrescar precios y agotados en vivo.

   Por eso está escrito en JavaScript plano, sin nada propio de Node ni del
   navegador más allá de fetch(), que existe en los dos.

   ⚠️ Usamos el endpoint "gviz" y NO la API de Google Sheets:
      - gviz no necesita llave, no tiene cuota publicada y manda cabeceras
        CORS, así que el navegador del cliente lo puede leer.
      - La URL de "publicar en la web" (pub?output=csv) redirige a
        googleusercontent.com SIN cabeceras CORS, así que el navegador la
        bloquea. Sirve en el build, pero no en vivo.
      - La API oficial sí necesita llave y Google planea cobrar excedentes.
   ========================================================================== */

/**
 * Arma la URL del Sheet en formato CSV.
 *
 * Para elegir la pestaña hay tres caminos, de más a menos robusto:
 *
 *   1. `gid`  — el número que sale en la URL del Sheet. Es el mejor: NO
 *               cambia aunque renombren la pestaña o muevan su orden.
 *   2. `hoja` — el nombre de la pestaña. Se rompe si la renombran.
 *   3. nada   — Google usa la PRIMERA pestaña. Suficiente mientras haya una.
 */
export function urlDelSheet(sheetId, hoja, gid) {
  const base =
    "https://docs.google.com/spreadsheets/d/" +
    encodeURIComponent(sheetId) +
    "/gviz/tq?tqx=out:csv";

  const numero = String(gid ?? "").trim();
  if (numero) return base + "&gid=" + encodeURIComponent(numero);

  const nombre = String(hoja ?? "").trim();
  if (nombre) return base + "&sheet=" + encodeURIComponent(nombre);

  return base;
}

/* --------------------------------------------------------------------------
   Parser de CSV
   Pequeño pero completo: entiende comillas, comas dentro de comillas y
   saltos de línea dentro de una celda. Nada de partir por comas a lo bruto,
   que es como se rompen estas cosas cuando alguien escribe
   "Pan grande, redondo" en una descripción.
   ----------------------------------------------------------------------- */
export function parsearCSV(texto) {
  const filas = [];
  let fila = [];
  let celda = "";
  let enComillas = false;

  // Normaliza saltos de línea de Windows
  const s = String(texto).replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < s.length; i++) {
    const c = s[i];

    if (enComillas) {
      if (c === '"') {
        if (s[i + 1] === '"') { celda += '"'; i++; }  // comilla escapada ""
        else enComillas = false;
      } else {
        celda += c;
      }
    } else if (c === '"') {
      enComillas = true;
    } else if (c === ",") {
      fila.push(celda); celda = "";
    } else if (c === "\n") {
      fila.push(celda); celda = "";
      filas.push(fila); fila = [];
    } else {
      celda += c;
    }
  }

  // Última celda / última fila
  if (celda !== "" || fila.length) { fila.push(celda); filas.push(fila); }

  // Fuera las filas totalmente vacías
  return filas.filter((f) => f.some((v) => String(v).trim() !== ""));
}

/** "Descripción" -> "descripcion". Para no depender de tildes ni mayúsculas. */
function normalizar(s) {
  return String(s)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Lee un precio escrito por una persona y devuelve un número.
 * Aguanta "2500", "2.500", "$ 2.500", "2,500" y " 2500 ".
 * Si no logra entenderlo, devuelve null (y el producto sale sin precio).
 */
export function leerPrecio(valor) {
  if (typeof valor === "number") return isFinite(valor) ? valor : null;
  if (valor == null) return null;

  const limpio = String(valor).replace(/[^\d]/g, "");   // deja solo dígitos
  if (limpio === "") return null;

  const n = parseInt(limpio, 10);
  return isFinite(n) ? n : null;
}

/**
 * Convierte las filas del Sheet en la estructura que dibuja la carta.
 *
 * Columnas esperadas (el orden da igual, se buscan por nombre):
 *   Seccion | Producto | Precio | Descripcion | Estado | Foto
 *
 * Las secciones salen en el orden en que aparecen por primera vez, así que
 * el dueño puede crear una sección nueva simplemente escribiendo su nombre.
 */
export function filasAMenu(filas) {
  if (!filas.length) return { paginas: [] };

  const encabezados = filas[0].map(normalizar);
  const col = (nombre) => encabezados.indexOf(nombre);

  const iSeccion = col("seccion");
  const iProducto = col("producto");
  const iPrecio = col("precio");
  const iDesc = col("descripcion");
  const iEstado = col("estado");
  const iFoto = col("foto");

  if (iProducto === -1) {
    throw new Error(
      'El Sheet no tiene una columna "Producto". ' +
      "Encabezados encontrados: " + filas[0].join(", ")
    );
  }

  const porSeccion = new Map();   // conserva el orden de inserción

  for (let i = 1; i < filas.length; i++) {
    const f = filas[i];
    const dato = (idx) => (idx === -1 ? "" : String(f[idx] ?? "").trim());

    const nombre = dato(iProducto);
    if (!nombre) continue;                       // fila sin producto: se salta

    const seccion = dato(iSeccion) || "Carta";

    // "Agotado", "AGOTADO", "agotado " -> "agotado"
    let etiqueta = normalizar(dato(iEstado));
    if (etiqueta !== "nuevo" && etiqueta !== "agotado") etiqueta = "";

    const producto = {
      nombre,
      precio: leerPrecio(dato(iPrecio)),
      desc: dato(iDesc),
      etiqueta,
    };

    const foto = dato(iFoto);
    if (foto) producto.img = foto;

    if (!porSeccion.has(seccion)) porSeccion.set(seccion, []);
    porSeccion.get(seccion).push(producto);
  }

  const paginas = [];
  for (const [titulo, productos] of porSeccion) {
    paginas.push({ titulo, subtitulo: "", productos });
  }

  return { paginas };
}

/**
 * Trae el menú del Sheet. Lanza error si algo sale mal: quien llama decide
 * qué hacer (en el build fallamos fuerte; en el navegador, en silencio).
 */
export async function traerMenu(sheetId, hoja, opciones = {}) {
  const { timeout = 10000, fetchImpl = fetch, gid = "" } = opciones;

  if (!sheetId) throw new Error("No hay SHEET_ID configurado");

  const control = new AbortController();
  const reloj = setTimeout(() => control.abort(), timeout);

  try {
    const res = await fetchImpl(urlDelSheet(sheetId, hoja, gid), {
      signal: control.signal,
      // Que no nos devuelvan una copia vieja de la caché
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(
        "Google respondió " + res.status + ". " +
        'Revisa que el Sheet esté compartido como "Cualquier persona con el enlace".'
      );
    }

    const texto = await res.text();

    // Si el Sheet no es público, Google devuelve HTML de login en vez de CSV
    if (texto.trimStart().startsWith("<")) {
      throw new Error(
        "Google devolvió una página en vez de datos. Casi seguro el Sheet no " +
        'está compartido como "Cualquier persona con el enlace".'
      );
    }

    const menu = filasAMenu(parsearCSV(texto));

    if (!menu.paginas.length) {
      throw new Error("El Sheet se leyó bien pero no tiene ningún producto");
    }

    return menu;
  } finally {
    clearTimeout(reloj);
  }
}
