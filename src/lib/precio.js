/* ============================================================================
   FORMATO DE PRECIOS
   Pesos colombianos, con separador de miles e IVA incluido.
   Se usa tanto en el build como en el navegador.
   ========================================================================== */

let formateador = null;
try {
  formateador = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
} catch {
  formateador = null;
}

/**
 * 2500 -> "$ 2.500"
 * Devuelve "" si el valor no es un número usable, para que el producto
 * simplemente salga sin precio en vez de mostrar "NaN" o "undefined".
 */
export function formatearPrecio(valor) {
  if (typeof valor !== "number" || !isFinite(valor)) return "";

  if (formateador) return formateador.format(valor);

  // Respaldo por si Intl no está disponible
  return "$ " + String(Math.round(valor)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
