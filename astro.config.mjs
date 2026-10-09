// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  // URL final en GitHub Pages. Si algún día hay dominio propio, se cambia acá
  // (y hay que regenerar el QR: ver qr/generar-qr.py).
  site: "https://jdgonzalezz2.github.io",
  base: "/menu_zahara",

  build: {
    // Mete el CSS dentro del HTML en vez de pedir un archivo aparte.
    // Es una petición menos, que con mala señal se nota.
    inlineStylesheets: "always",
  },

  // Sin prefetch: la carta es una sola página, no hay nada que precargar.
  prefetch: false,
});
