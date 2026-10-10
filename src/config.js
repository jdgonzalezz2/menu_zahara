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

/**
 * Cuántos productos caben, como máximo, en una página de la carta.
 *
 * Una sección con más productos se parte sola en varias páginas, repartidas
 * parejo: con 7 productos salen páginas de 4 y 3, no de 6 y 1.
 *
 * La idea es que el cliente PASE PÁGINAS en vez de hacer scroll, que es la
 * gracia del formato revista.
 *
 * Con 6 y fotos de 84 px la página queda bien llena sin desbordarse. Si lo
 * subes mucho vuelve el scroll; si lo bajas, hay más páginas que pasar.
 */
export const MAX_PRODUCTOS_POR_PAGINA = 6;

/* --- Identidad del negocio ---------------------------------------------
   Esto cambia muy de vez en cuando, así que vive en el código y no en el
   Sheet: menos cosas que se puedan romper en el día a día.
   ---------------------------------------------------------------------- */
export const NEGOCIO = {
  nombre: "Panadería Zahara",

  // Título y lema de la portada.
  titulo: "Menú de Desayunos",
  lema: "Recién horneado, preparado con cariño",

  /**
   * Fotografía principal de la portada. Es la imagen que más vende, así que
   * va grande y se carga de una (no lazy): es lo primero que ve el cliente.
   * Déjala en "" si no quieres foto en la portada.
   */
  fotoPortada: "croissant-tinto.webp",

  // ✅ Confirmada en la ficha de Google Maps del negocio
  direccion: "Cra. 59 #132A-36, Bogotá",

  // ✅ Confirmado por Julián
  horario: "6:00 a.m. – 10:00 p.m.",

  // ⚠️ NO agregar teléfono: Julián confirmó que ya NO tienen línea.
  //    El número "12855192" que todavía aparece en Google está desactualizado.
  //    Si algún día hay un WhatsApp para domicilios, va acá.
  //
  // El Instagram se omite mientras no sepamos si tienen. Un campo ausente
  // simplemente no se dibuja en la contraportada.
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
 * ➡️ Ponlo en true si algún día hay que volver a meter datos de prueba.
 *
 * Apagado el 9 de octubre de 2026: el Sheet ya tiene los 11 combos reales
 * con los precios que confirmó Julián.
 */
export const BORRADOR = false;
