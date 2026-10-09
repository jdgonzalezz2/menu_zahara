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
  nombre: "Panadería Zahara",
  lema: "Panadería · Desayunos · Pizzería · Frutería",

  // ✅ Confirmada en la ficha de Google Maps del negocio
  direccion: "Cra. 59 #132A-36, Bogotá",

  // ⚠️ PENDIENTES. No los inventamos: van como marcador hasta confirmarlos.
  //
  //  - horario:  Google solo muestra "Cierra a las 10 p.m.". Falta la hora
  //              de apertura y qué pasa los domingos y festivos.
  //  - telefono: Google muestra "12855192", que parece el fijo de Bogotá en
  //              formato viejo → hoy sería (601) 285 5192. HAY QUE
  //              CONFIRMARLO con el dueño antes de publicarlo, y preguntar
  //              si prefieren un WhatsApp para domicilios.
  horario: "[Horario pendiente de confirmar]",
  telefono: "[Teléfono pendiente de confirmar]",
  instagram: "[@usuario pendiente]",
};

/**
 * Modo borrador.
 *
 * En true, la carta le pide a los buscadores que NO la indexen.
 *
 * Está así a propósito: Zahara es un negocio real, con 555 reseñas en
 * Google, y mientras los productos del Sheet sigan siendo los de ejemplo
 * sería feo que Google indexara precios inventados bajo su nombre.
 *
 * ➡️ Ponlo en false cuando el Sheet ya tenga los productos y precios reales
 *    confirmados por el dueño.
 */
export const BORRADOR = true;
