/* ============================================================================
   CONFIGURACIÓN DEL PROYECTO
   Lo único que hay que tocar acá es SHEET_ID cuando el Google Sheet esté listo.
   ========================================================================== */

/**
 * ID del Google Sheet con los productos.
 *
 * Se saca de la URL del Sheet:
 *   https://docs.google.com/spreadsheets/d/ESTO_DE_ACA_EN_MEDIO/edit
 *                                          ^^^^^^^^^^^^^^^^^^^^
 *
 * Mientras esté vacío (""), la carta usa los datos de ejemplo de
 * src/data/menu-respaldo.json y no intenta conectarse a ningún lado.
 *
 * Instrucciones completas en README.md, sección "El Excel del dueño".
 */
export const SHEET_ID = "1GRbr40yOgO5fw_qvo7ldxz-1wGOoTRGcm6GkXiZUIUI";

/**
 * Nombre de la pestaña del Sheet donde están los productos.
 *
 * Déjalo vacío ("") y se usa la PRIMERA pestaña, se llame como se llame.
 * Es lo recomendado mientras haya una sola pestaña: una cosa menos que se
 * puede escribir mal. Solo vale la pena poner el nombre exacto si algún día
 * la hoja tiene varias pestañas y hay que elegir una.
 */
export const SHEET_HOJA = "";

/**
 * gid de la pestaña: el número que aparece al final de la URL del Sheet
 *   .../edit?gid=1450287302#gid=1450287302
 *                ^^^^^^^^^^
 * Es la forma MÁS robusta de apuntar a una pestaña: no cambia aunque la
 * renombren o la muevan de posición. Si está puesto, manda sobre SHEET_HOJA.
 */
export const SHEET_GID = "1450287302";

/**
 * Cuánto espera la carta, ya abierta en el celular del cliente, a que Google
 * le responda con los precios frescos antes de rendirse y quedarse con los
 * datos horneados. Corto a propósito: el cliente nunca debe esperar.
 */
export const TIMEOUT_EN_VIVO = 2500;

/* --- Identidad del negocio ---------------------------------------------
   Esto cambia muy de vez en cuando, así que vive en el código y no en el
   Sheet: menos cosas que se puedan romper en el día a día.
   ---------------------------------------------------------------------- */
export const NEGOCIO = {
  nombre: "Panadería El Horno",          // ← nombre de MUESTRA
  lema: "Pan de verdad, todos los días",

  // Datos reales PENDIENTES (déjalos así hasta tenerlos):
  direccion: "[Dirección pendiente]",
  horario: "[Horario pendiente — ej: Lun–Sáb 6:00 a.m. – 8:00 p.m.]",
  telefono: "[Teléfono / WhatsApp pendiente]",
  instagram: "[@usuario pendiente]",
};
