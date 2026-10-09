/* ============================================================================
   LÓGICA DEL CLIENTE

   Dos cosas, y nada más:

   1. Pasar páginas (toque, swipe, botones, puntitos, teclado).
   2. Refrescar precios y agotados en vivo desde el Google Sheet.

   Ojo: las páginas YA vienen dibujadas en el HTML desde el build. Acá no se
   construye nada, solo se mueve. Por eso este archivo es tan corto.
   ========================================================================== */

import { parsearCSV, filasAMenu } from "../lib/sheet.js";
import { formatearPrecio } from "../lib/precio.js";

/* ==========================================================================
   1. NAVEGACIÓN
   ========================================================================== */

const paginas = Array.from(document.querySelectorAll(".page"));
const total = paginas.length;

if (total) {
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");
  const tapPrev = document.getElementById("tapPrev");
  const tapNext = document.getElementById("tapNext");
  const counter = document.getElementById("counter");
  const live = document.getElementById("live");
  const stage = document.getElementById("stage");
  const dots = Array.from(document.querySelectorAll(".dot"));

  let actual = 0;
  let animando = false;

  /** Aplica el estado visual de todas las páginas y controles. */
  function pintar() {
    paginas.forEach((hoja, i) => {
      const pasada = i < actual;

      hoja.classList.toggle("flipped", pasada);
      hoja.classList.toggle("is-current", i === actual);

      // Las páginas pasadas quedan debajo; las pendientes, encima, con la
      // actual de primera. La hoja que está girando se pone sobre todas.
      //
      // ⚠️ El z-index se calcula acá y no en el CSS: este script lo escribe
      // como estilo inline, y el inline le gana siempre a la hoja de estilos.
      hoja.style.zIndex = hoja.classList.contains("lift")
        ? 900
        : pasada
          ? i
          : 2 * total - i;

      hoja.setAttribute("aria-hidden", i === actual ? "false" : "true");
    });

    dots.forEach((d, i) => {
      d.setAttribute("aria-current", i === actual ? "true" : "false");
      d.setAttribute("aria-selected", i === actual ? "true" : "false");
    });

    btnPrev.disabled = actual === 0;
    btnNext.disabled = actual === total - 1;
    counter.textContent = `${actual + 1}/${total}`;

    const titulo = paginas[actual].dataset.titulo || "";
    live.textContent = `Página ${actual + 1} de ${total}: ${titulo}`;
  }

  /** Va a una página concreta, levantando la hoja que gira. */
  function irA(destino) {
    if (animando) return;
    destino = Math.max(0, Math.min(total - 1, destino));
    if (destino === actual) return;

    // La hoja que se mueve es la que sale (hacia adelante)
    // o la que vuelve (hacia atrás).
    const moviendo = destino > actual ? paginas[actual] : paginas[destino];

    animando = true;
    moviendo.classList.add("lift");
    actual = destino;
    pintar();

    let listo = false;
    const fin = () => {
      if (listo) return;
      listo = true;
      moviendo.classList.remove("lift");
      animando = false;
      moviendo.removeEventListener("transitionend", fin);
      pintar();   // devuelve a la hoja su z-index normal
    };
    moviendo.addEventListener("transitionend", fin);
    setTimeout(fin, 750);   // red de seguridad si no llega transitionend
  }

  const siguiente = () => irA(actual + 1);
  const anterior = () => irA(actual - 1);

  btnNext.addEventListener("click", siguiente);
  btnPrev.addEventListener("click", anterior);
  tapNext.addEventListener("click", siguiente);
  tapPrev.addEventListener("click", anterior);

  dots.forEach((d) =>
    d.addEventListener("click", () => irA(Number(d.dataset.indice)))
  );

  // --- Teclado ---
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "ArrowRight") siguiente();
    else if (ev.key === "ArrowLeft") anterior();
    else if (ev.key === "Home") irA(0);
    else if (ev.key === "End") irA(total - 1);
    else return;
    ev.preventDefault();
  });

  // --- Swipe ---
  // Solo cuenta como "pasar página" si el gesto es claramente horizontal;
  // así el scroll vertical dentro de una página sigue funcionando.
  let x0 = 0;
  let y0 = 0;
  let rastreando = false;

  stage.addEventListener(
    "touchstart",
    (ev) => {
      if (ev.touches.length !== 1) { rastreando = false; return; }
      x0 = ev.touches[0].clientX;
      y0 = ev.touches[0].clientY;
      rastreando = true;
    },
    { passive: true }
  );

  stage.addEventListener(
    "touchend",
    (ev) => {
      if (!rastreando) return;
      rastreando = false;

      const t = ev.changedTouches[0];
      const dx = t.clientX - x0;
      const dy = t.clientY - y0;

      if (Math.abs(dx) < 45) return;                   // muy corto
      if (Math.abs(dx) < Math.abs(dy) * 1.2) return;   // fue más vertical

      if (dx < 0) siguiente();
      else anterior();
    },
    { passive: true }
  );

  pintar();
}

/* ==========================================================================
   2. REFRESCO EN VIVO DESDE EL GOOGLE SHEET

   Corre DESPUÉS de que la carta ya se ve. Si funciona, actualiza precios y
   agotados sin que el cliente note nada. Si falla —sin red, Google caído,
   CORS, lo que sea— no pasa absolutamente nada: se queda lo horneado.

   Por eso todo está dentro de un try/catch que se traga los errores: acá un
   fallo NO es un problema, es el camino esperado la mitad de las veces.
   ========================================================================== */

async function refrescarEnVivo() {
  const etiqueta = document.getElementById("config-en-vivo");
  if (!etiqueta) return;   // no hay Sheet configurado

  let config;
  try {
    config = JSON.parse(etiqueta.textContent);
  } catch {
    return;
  }
  if (!config?.url) return;

  const control = new AbortController();
  const reloj = setTimeout(() => control.abort(), config.timeout || 2500);

  let menu;
  try {
    const res = await fetch(config.url, {
      signal: control.signal,
      cache: "no-store",
    });
    if (!res.ok) return;

    const texto = await res.text();
    if (texto.trimStart().startsWith("<")) return;   // vino HTML, no datos

    menu = filasAMenu(parsearCSV(texto));
  } catch {
    // Silencio a propósito. Ver el comentario de arriba.
    return;
  } finally {
    clearTimeout(reloj);
  }

  if (!menu?.paginas?.length) return;

  // Aplana a un índice por nombre de producto
  const frescos = new Map();
  for (const seccion of menu.paginas) {
    for (const p of seccion.productos) frescos.set(p.nombre, p);
  }

  let cambios = 0;

  for (const li of document.querySelectorAll(".item[data-producto]")) {
    const fresco = frescos.get(li.dataset.producto);
    if (!fresco) continue;
    if (actualizarFila(li, fresco)) cambios++;
  }

  if (cambios) {
    console.log(`[carta] ${cambios} producto(s) actualizados en vivo`);
  }
}

/**
 * Pone al día una fila de la carta. Devuelve true si algo cambió.
 * Solo toca precio y disponibilidad: lo que cambia durante el día.
 */
function actualizarFila(li, fresco) {
  const agotado = fresco.etiqueta === "agotado";
  const nuevo = fresco.etiqueta === "nuevo";
  let cambio = false;

  // --- Estado agotado ---
  if (li.classList.contains("agotado") !== agotado) {
    li.classList.toggle("agotado", agotado);
    cambio = true;
  }

  // --- Etiquetas ---
  const nombre = li.querySelector(".item-name");
  if (nombre) {
    const tagActual = nombre.querySelector(".tag");
    const textoDeseado = agotado ? "Agotado" : nuevo ? "Nuevo" : null;

    if (!textoDeseado && tagActual) {
      tagActual.remove();
      cambio = true;
    } else if (textoDeseado && tagActual?.textContent !== textoDeseado) {
      if (tagActual) tagActual.remove();
      const span = document.createElement("span");
      span.className = "tag " + (agotado ? "tag-agotado" : "tag-nuevo");
      span.textContent = textoDeseado;
      nombre.appendChild(span);
      cambio = true;
    }
  }

  // --- Precio (los agotados van sin precio) ---
  const row = li.querySelector(".item-row");
  let precioEl = li.querySelector(".item-price");
  const textoPrecio = agotado ? "" : formatearPrecio(fresco.precio);

  if (!textoPrecio && precioEl) {
    precioEl.remove();
    cambio = true;
  } else if (textoPrecio) {
    if (!precioEl) {
      precioEl = document.createElement("span");
      precioEl.className = "item-price";
      row?.appendChild(precioEl);
      cambio = true;
    }
    if (precioEl.textContent !== textoPrecio) {
      precioEl.textContent = textoPrecio;
      cambio = true;
    }
  }

  return cambio;
}

// Arranca cuando el navegador esté desocupado, para no pelear con el
// primer dibujado de la carta.
if ("requestIdleCallback" in window) {
  requestIdleCallback(() => refrescarEnVivo(), { timeout: 3000 });
} else {
  setTimeout(refrescarEnVivo, 1200);
}
