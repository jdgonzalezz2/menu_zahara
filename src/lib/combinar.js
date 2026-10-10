/* ============================================================================
   COMBINAR EL SHEET CON EL CATÁLOGO DE RESPALDO

   El Google Sheet es la fuente de verdad, pero mientras se termina de
   llenar puede tener solo una parte de la carta. Esta función deja que la
   maqueta se vea completa sin desconectar el Sheet:

     - Si una sección existe en el Sheet, GANA EL SHEET. Siempre.
     - Si no existe todavía, se usa la del respaldo.
     - Las secciones que solo existen en el Sheet se agregan al final.

   Lo bueno es que se resuelve sola: el día que el Sheet tenga la carta
   entera, el respaldo deja de aportar nada y esta función se vuelve un
   paso que no hace nada.
   ========================================================================== */

/** "Bebidas Calientes" y "bebidas calientes" son la misma sección. */
function normalizar(titulo) {
  return String(titulo ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * @param {Array} delSheet    Secciones leídas del Google Sheet
 * @param {Array} delRespaldo Secciones del catálogo local, en el orden en
 *                            que deben salir en la carta
 * @returns {Array} secciones combinadas, cada una con `origen`
 */
export function combinarSecciones(delSheet, delRespaldo) {
  const sheet = Array.isArray(delSheet) ? delSheet : [];
  const respaldo = Array.isArray(delRespaldo) ? delRespaldo : [];

  const pendientes = new Map();
  for (const sec of sheet) {
    const clave = normalizar(sec.titulo);
    // Si el Sheet trae la misma sección dos veces, se queda la primera
    if (!pendientes.has(clave)) pendientes.set(clave, sec);
  }

  const resultado = [];

  // El orden lo define el respaldo: es el orden con el que se diseñó la carta
  for (const sec of respaldo) {
    const clave = normalizar(sec.titulo);

    if (pendientes.has(clave)) {
      resultado.push({ ...pendientes.get(clave), origen: "sheet" });
      pendientes.delete(clave);
    } else {
      resultado.push({ ...sec, origen: "respaldo" });
    }
  }

  // Secciones que solo existen en el Sheet: van al final, en su orden
  for (const sec of sheet) {
    if (pendientes.has(normalizar(sec.titulo))) {
      resultado.push({ ...sec, origen: "sheet" });
      pendientes.delete(normalizar(sec.titulo));
    }
  }

  return resultado;
}
