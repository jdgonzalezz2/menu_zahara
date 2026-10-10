/* ============================================================================
   EL CATÁLOGO MANDA; EL SHEET SOLO PONE PRECIOS

   Reparto de responsabilidades:

     - QUÉ productos hay, cómo se llaman, qué incluyen, en qué sección van
       y en qué orden  ->  src/data/catalogo.json, o sea el código.
     - CUÁNTO cuestan y si se agotaron  ->  el Google Sheet.

   Esto es a propósito. Agregar o quitar productos es una decisión de carta,
   y una carta no se rediseña sola porque alguien escriba una fila nueva en
   una hoja de cálculo. Los precios y los agotados sí cambian a diario y
   tienen que poder cambiarse sin tocar código.

   Consecuencia práctica: una fila del Sheet que no corresponda a ningún
   producto del catálogo SE IGNORA. No aparece en la carta.
   ========================================================================== */

/** "Café en Leche" y "café en leche " son el mismo producto. */
function normalizar(nombre) {
  return String(nombre ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Devuelve el catálogo con los precios y los estados que diga el Sheet.
 *
 * @param {Array} catalogo   Secciones del catálogo (la carta de verdad)
 * @param {Array} delSheet   Secciones leídas del Sheet (solo aportan datos)
 * @returns {{paginas: Array, aplicados: number, ignorados: string[]}}
 *   `ignorados` son los nombres del Sheet que no existen en el catálogo:
 *   sirven para avisar en el build de una fila mal escrita.
 */
export function aplicarPreciosDelSheet(catalogo, delSheet) {
  const porNombre = new Map();

  for (const seccion of delSheet || []) {
    for (const producto of seccion.productos || []) {
      const clave = normalizar(producto.nombre);
      // Si el nombre está repetido en el Sheet, manda la primera fila
      if (clave && !porNombre.has(clave)) porNombre.set(clave, producto);
    }
  }

  const usados = new Set();

  const paginas = (catalogo || []).map((seccion) => ({
    ...seccion,
    productos: (seccion.productos || []).map((producto) => {
      const clave = normalizar(producto.nombre);
      const delSheetProducto = porNombre.get(clave);

      if (!delSheetProducto) return { ...producto };

      usados.add(clave);

      return {
        ...producto,
        // Un precio ilegible en el Sheet no borra el del catálogo
        precio:
          typeof delSheetProducto.precio === "number" &&
          isFinite(delSheetProducto.precio)
            ? delSheetProducto.precio
            : producto.precio,
        etiqueta: delSheetProducto.etiqueta || "",
      };
    }),
  }));

  const ignorados = [];
  for (const [clave, producto] of porNombre) {
    if (!usados.has(clave)) ignorados.push(producto.nombre);
  }

  return { paginas, aplicados: usados.size, ignorados };
}
