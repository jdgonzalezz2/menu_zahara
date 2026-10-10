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

  /**
   * Pinta la luz sobre una hoja según cuánto lleve girada (0 a 1).
   * Al inclinarse, el frente se va de la luz y el revés entra en ella.
   */
  function pintarLuz(hoja, giro) {
    const frente = hoja.querySelector(".face.front .brillo");
    const reverso = hoja.querySelector(".face.back .brillo");
    if (frente) frente.style.opacity = String(giro * 0.9);
    if (reverso) reverso.style.opacity = String((1 - giro) * 0.95);
  }

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

      // La hoja que está bajo el dedo maneja su propia luz
      if (!hoja.classList.contains("arrastrando")) {
        pintarLuz(hoja, pasada ? 1 : 0);
      }

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

  /* ---- Arrastre: la hoja va pegada al dedo ----------------------------
     Esto es lo que separa "cambia de página" de "estoy pasando una hoja".
     Mientras el dedo se mueve no hay transición: se escribe el ángulo
     directo. Al soltar, se decide si completa el giro o se devuelve, y ahí
     sí entra la transición.
     -------------------------------------------------------------------- */

  const UMBRAL_DIRECCION = 10;   // px antes de decidir si el gesto es horizontal
  const UMBRAL_COMPLETAR = 0.3;  // fracción de página a partir de la cual se pasa
  const VELOCIDAD_MINIMA = 0.45; // px/ms para que cuente como flick
  const FLICK_MINIMO = 0.12;     // ...pero un flick también tiene que recorrer algo

  let gesto = null;

  function anchoLibro() {
    return document.getElementById("book").offsetWidth || window.innerWidth;
  }

  /** Pinta la hoja a mitad de giro, sin transición. */
  function aplicarGiro(hoja, giro) {
    hoja.style.transform = `rotateY(${-180 * giro}deg)`;
    pintarLuz(hoja, giro);
  }

  stage.addEventListener("touchstart", (ev) => {
    if (ev.touches.length !== 1 || animando) { gesto = null; return; }
    gesto = {
      x0: ev.touches[0].clientX,
      y0: ev.touches[0].clientY,
      t0: performance.now(),
      decidido: false,
      hoja: null,
      haciaAdelante: true,
      giro: 0,
    };
  }, { passive: true });

  stage.addEventListener("touchmove", (ev) => {
    if (!gesto || ev.touches.length !== 1) return;

    const dx = ev.touches[0].clientX - gesto.x0;
    const dy = ev.touches[0].clientY - gesto.y0;

    if (!gesto.decidido) {
      // Todavía puede ser un scroll vertical: no secuestramos el gesto
      if (Math.abs(dx) < UMBRAL_DIRECCION) return;
      if (Math.abs(dx) < Math.abs(dy) * 1.2) { gesto = null; return; }

      gesto.haciaAdelante = dx < 0;

      // Hacia adelante gira la página actual; hacia atrás, la anterior
      const indice = gesto.haciaAdelante ? actual : actual - 1;
      if (indice < 0 || indice >= total) { gesto = null; return; }

      gesto.hoja = paginas[indice];
      gesto.decidido = true;

      gesto.hoja.classList.add("arrastrando", "lift");
      gesto.hoja.style.zIndex = 900;
    }

    // De acá en adelante el gesto es nuestro: que no haga scroll
    if (ev.cancelable) ev.preventDefault();

    const avance = Math.abs(dx) / anchoLibro();
    const limitado = Math.max(0, Math.min(1, avance));

    gesto.giro = gesto.haciaAdelante ? limitado : 1 - limitado;
    aplicarGiro(gesto.hoja, gesto.giro);
  }, { passive: false });

  function soltar(ev) {
    if (!gesto) return;
    if (!gesto.decidido) { gesto = null; return; }

    const g = gesto;
    gesto = null;

    const t = ev.changedTouches ? ev.changedTouches[0] : null;
    const dx = t ? t.clientX - g.x0 : 0;
    const ms = Math.max(1, performance.now() - g.t0);
    const velocidad = Math.abs(dx) / ms;

    const avance = Math.abs(dx) / anchoLibro();

    // Un recorrido largo pasa página. Un flick rápido también, pero solo si
    // además recorrió algo: sin eso, un temblor de 30 px en un instante da
    // una velocidad altísima y pasa página sin que el usuario lo pidiera.
    const completa =
      avance > UMBRAL_COMPLETAR ||
      (velocidad > VELOCIDAD_MINIMA && avance > FLICK_MINIMO);

    // Se devuelve el control al CSS: al quitar el transform en línea, la
    // transición anima desde donde quedó la hoja.
    // Se devuelve el control al CSS para el transform; --giro lo fija
    // pintar() justo abajo, y la transición corre desde donde quedó.
    g.hoja.classList.remove("arrastrando");
    g.hoja.style.transform = "";

    if (completa) {
      actual = g.haciaAdelante ? actual + 1 : actual - 1;
      actual = Math.max(0, Math.min(total - 1, actual));
    }

    animando = true;
    pintar();

    let listo = false;
    const fin = () => {
      if (listo) return;
      listo = true;
      g.hoja.classList.remove("lift");
      animando = false;
      g.hoja.removeEventListener("transitionend", fin);
      pintar();
    };
    g.hoja.addEventListener("transitionend", fin);
    setTimeout(fin, 750);
  }

  stage.addEventListener("touchend", soltar, { passive: true });
  stage.addEventListener("touchcancel", () => { 
    if (gesto && gesto.decidido) soltar({ changedTouches: null });
    gesto = null;
  }, { passive: true });

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
