/* ============================================================================
   PARTIR LAS SECCIONES EN PÁGINAS

   La gracia de un flipbook es pasar páginas, no hacer scroll. Así que una
   sección con muchos productos se parte en varias páginas.

   El reparto es PAREJO, no "llena y sigue". Con 7 productos y un máximo de 6,
   llenar daría páginas de 6 y 1 —y una página con un solo producto se ve
   rota—; repartir da 4 y 3.
   ========================================================================== */

/**
 * Convierte una lista de secciones en una lista de páginas.
 *
 * Cada página que sale conserva el título de su sección y agrega `parte` y
 * `totalPartes`, para que la carta pueda mostrar "2/3" cuando una sección
 * ocupa varias páginas.
 *
 * @param {Array} secciones  [{ titulo, subtitulo, productos: [] }]
 * @param {number} max       Máximo de productos por página
 */
export function paginarSecciones(secciones, max) {
  const limite = Number.isFinite(max) && max > 0 ? Math.floor(max) : 6;
  const paginas = [];

  // Número de SECCIÓN, no de página: las dos partes de "Desayunos" son
  // ambas la 01, aunque ocupen las páginas 1 y 2.
  let numeroSeccion = 0;

  for (const seccion of secciones || []) {
    const productos = seccion.productos || [];

    // Una sección sin productos no genera página
    if (!productos.length) continue;

    numeroSeccion++;

    const totalPartes = Math.ceil(productos.length / limite);

    // Reparto parejo: los primeros `resto` trozos llevan uno de más.
    const base = Math.floor(productos.length / totalPartes);
    const resto = productos.length % totalPartes;

    let desde = 0;
    for (let i = 0; i < totalPartes; i++) {
      const cuantos = base + (i < resto ? 1 : 0);

      paginas.push({
        titulo: seccion.titulo,
        // El subtítulo solo en la primera parte: repetirlo se siente a error.
        subtitulo: i === 0 ? seccion.subtitulo || "" : "",
        productos: productos.slice(desde, desde + cuantos),
        parte: i + 1,
        totalPartes,
        numeroSeccion,
      });

      desde += cuantos;
    }
  }

  return paginas;
}

/** Nombre de la página, para los puntitos y los lectores de pantalla. */
export function nombreDePagina(pagina) {
  return pagina.totalPartes > 1
    ? `${pagina.titulo} (${pagina.parte}/${pagina.totalPartes})`
    : pagina.titulo;
}
