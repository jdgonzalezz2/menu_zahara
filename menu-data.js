/* ============================================================================
   DATOS DEL MENÚ — Panadería El Horno (datos de EJEMPLO)
   ----------------------------------------------------------------------------
   Este es el ÚNICO archivo que necesitas tocar para cambiar productos y
   precios. No hace falta saber programar: edita el texto entre comillas,
   guarda, y haz commit + push (ver README.md).

   CÓMO FUNCIONA CADA PRODUCTO:
     { nombre: "Pandebono", precio: 2500, desc: "...", etiqueta: "nuevo" }

   - nombre   -> el nombre del producto (obligatorio)
   - precio   -> número en COP, SIN puntos ni símbolo $ (ej: 2500, no "$2.500")
                 El menú le pone los puntos de miles solo. IVA ya incluido.
   - desc     -> descripción corta (opcional). Déjala "" si no quieres.
   - etiqueta -> "nuevo"   -> muestra la insignia NUEVO
                 "agotado" -> muestra el producto atenuado y SIN precio
                 ""        -> producto normal
   - img      -> (opcional) nombre de la foto en la carpeta assets/ en WebP.
                 Ej: img: "pandebono.webp". Déjala sin poner si no hay foto.

   ⚠️  OJO: respeta las comillas "" y las comas , entre líneas.
   ========================================================================== */

const MENU = {

  // --- Identidad del negocio (cámbiala por la real cuando la tengas) ---
  negocio: {
    nombre: "Panadería El Horno",        // ← nombre de MUESTRA
    lema: "Pan de verdad, todos los días",
    // Datos reales PENDIENTES (déjalos como están hasta tenerlos):
    direccion: "[Dirección pendiente]",
    horario: "[Horario pendiente — ej: Lun–Sáb 6:00 a.m. – 8:00 p.m.]",
    telefono: "[Teléfono / WhatsApp pendiente]",
    instagram: "[@usuario pendiente]",
  },

  // --- Páginas del menú ---
  // Cada página tiene un título y una lista de productos.
  // El orden de abajo es el orden en que se pasan las páginas.
  paginas: [

    {
      titulo: "Panadería",
      subtitulo: "Recién salido del horno",
      productos: [
        { nombre: "Pandebono",            precio: 2500, desc: "Clásico, suave por dentro y dorado por fuera." },
        { nombre: "Almojábana",           precio: 2800, desc: "Con queso costeño, esponjosa." },
        { nombre: "Pan de queso",         precio: 2600, desc: "Masa de yuca y queso." },
        { nombre: "Roscón con arequipe",  precio: 4500, desc: "Relleno generoso de arequipe.", etiqueta: "nuevo" },
        { nombre: "Mojicón",              precio: 3000, desc: "Dulce, con azúcar por encima." },
        { nombre: "Pan aliñado",          precio: 2000, desc: "" },
      ],
    },

    {
      titulo: "Desayunos",
      subtitulo: "Para empezar bien el día",
      productos: [
        { nombre: "Caldo de costilla",    precio: 9000,  desc: "Con papa, cilantro y arepa." },
        { nombre: "Calentado paisa",      precio: 12000, desc: "Arroz, frijol, huevo y arepa." },
        { nombre: "Huevos al gusto",      precio: 7000,  desc: "Revueltos o fritos, con pan." },
        { nombre: "Tamal santafereño",    precio: 10000, desc: "Fin de semana.", etiqueta: "agotado" },
        { nombre: "Arepa de huevo",       precio: 4000,  desc: "" },
      ],
    },

    {
      titulo: "Bebidas",
      subtitulo: "Calientes y frías",
      productos: [
        { nombre: "Chocolate con queso",  precio: 5500, desc: "Espumoso, con porción de queso." },
        { nombre: "Aguapanela con limón", precio: 3500, desc: "" },
        { nombre: "Café en leche",        precio: 4000, desc: "" },
        { nombre: "Tinto campesino",      precio: 2000, desc: "" },
        { nombre: "Jugo natural del día", precio: 5000, desc: "Pregunta por la fruta.", etiqueta: "nuevo" },
        { nombre: "Avena helada",         precio: 4500, desc: "" },
      ],
    },

    {
      titulo: "Postres",
      subtitulo: "Para el gusto dulce",
      productos: [
        { nombre: "Merengón",             precio: 8000, desc: "Merengue con crema y frutas." },
        { nombre: "Obleas con arequipe",  precio: 4000, desc: "Con queso rallado y mora." },
        { nombre: "Flan de caramelo",     precio: 5000, desc: "" },
        { nombre: "Torta de la casa",     precio: 6000, desc: "Pregunta por el sabor del día." },
        { nombre: "Brevas con arequipe",  precio: 6500, desc: "", etiqueta: "agotado" },
      ],
    },

  ],
};
