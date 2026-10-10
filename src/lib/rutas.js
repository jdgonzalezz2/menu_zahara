/* ============================================================================
   RUTAS DE ARCHIVOS

   Astro entrega BASE_URL a veces con barra final y a veces sin ella, según
   la versión y la configuración. Pegar cadenas a mano produce rutas como
   "/menu_zaharaassets/foto.webp", que dan 404 y solo se notan en producción.
   Esta función une los pedazos con exactamente una barra.
   ========================================================================== */

/** Ruta pública de una foto en public/assets/. */
export function rutaDeAsset(base, archivo) {
  const raiz = String(base ?? "/").replace(/\/+$/, "");   // sin barra final
  const nombre = String(archivo ?? "").replace(/^\/+/, ""); // sin barra inicial
  return `${raiz}/assets/${nombre}`;
}
