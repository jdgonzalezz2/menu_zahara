# Bitácora del proyecto

> **Para Claude (o cualquier IA) en sesiones futuras:** este archivo es la
> memoria del proyecto. Léelo junto con `CLAUDE.md` antes de hacer nada.
> `CLAUDE.md` dice *qué queremos y por qué*; esta bitácora dice *dónde vamos,
> qué ya decidimos y qué falta*. Cuando termines un bloque de trabajo,
> **agrega una entrada nueva al final de la línea de tiempo**. No reescribas
> las entradas viejas: son historia.

> **Para Julián:** si algún día abres un chat nuevo y le dices *"ponte al
> día"*, esto es lo que va a leer.

---

## 📍 Estado actual (al 9 de octubre de 2026)

**Dónde estamos:** hay una **v1 funcionando y subida a GitHub**. Es una carta
tipo revista, de 6 páginas, hecha en HTML/CSS/JS puro, con datos de ejemplo.

**Qué funciona hoy**

- Flipbook de 6 páginas con giro 3D sobre el lomo izquierdo.
- Navegación: toque en los lados, swipe, botones ‹ ›, puntitos y teclado.
- Tema claro y oscuro automáticos.
- Productos con estado **nuevo** / **agotado** (el agotado sale sin precio).
- Precios en COP con separador de miles e IVA incluido.
- QR estático de 1000×1000 listo para imprimir.

**Qué NO funciona todavía**

- 🔴 **El QR no sirve aún.** Apunta a `https://jdgonzalezz2.github.io/menu_zahara/`,
  una URL que todavía no existe porque falta activar GitHub Pages.
- 🔴 **El repositorio está privado.** GitHub Pages en cuenta gratis **solo
  publica repos públicos**. Hay que hacerlo público (o pagar Pro). Esto
  bloquea todo lo demás.
- 🟡 Los productos, los precios y el nombre son **de ejemplo**.
- 🟡 El dueño todavía no puede editar nada por su cuenta (es el objetivo de la v2).

---

## 🗓️ Línea de tiempo

### Sesión 1 — 9 de octubre de 2026 — *Construcción de la v1*

**Punto de partida:** la carpeta tenía un solo archivo, `CLAUDE.md`, que no era
documentación sino el prompt de arranque. No había nada en GitHub.

**Lo que se hizo**

1. Se construyó el proyecto completo descrito en `CLAUDE.md`:
   `index.html`, `menu-data.js`, `README.md`, `assets/`, `qr/`.
2. Se generó el QR estático con la librería `qrcode` de Python, **offline**,
   apuntando a la URL de GitHub Pages del repo.
3. Se verificó el resultado de verdad, no "a ojo":
   - Un script de Node validó la estructura de `menu-data.js` y 14 requisitos
     del `index.html` (tokens, tema oscuro, sin CDN, teclado, swipe, etc.).
   - Se renderizó con Chrome headless en tema claro y oscuro, y se comprobó el
     paso de página, el formato de precios y el estado "agotado".
4. `git init` + commit + push a `https://github.com/jdgonzalezz2/menu_zahara`.

**Dos bugs encontrados y arreglados durante la verificación**

- El `z-index: 900` de la hoja que gira **nunca se aplicaba**: el JS escribe
  `style.zIndex` inline y el inline le gana a la hoja de estilos. La página se
  hundía de golpe en vez de verse girar. Ahora el z-index de la hoja que gira
  lo calcula el propio JS.
- `transform-style: preserve-3d` en el contenedor `.book` creaba un contexto
  3D donde **se ignora el `z-index`**, que es justo el mecanismo con el que se
  apilan las hojas. Se movió la `perspective` al contenedor y se quitó el
  `preserve-3d` de ese nivel.

**Trampa a recordar:** Chrome headless en Windows **no baja de 500px** de
ancho de viewport e ignora `--window-size` menores. Las primeras capturas
parecían tener un bug de maquetación (contenido corrido a la derecha, precios
cortados) y era puro artefacto del headless. Si vuelve a pasar: medir
`window.innerWidth` antes de creerle a una captura.

**Commit:** `35b400d` — *Menú digital con QR para la panadería*

---

### Sesión 2 — 9 de octubre de 2026 — *Auditoría técnica y plan de la v2*

**Lo que pidió Julián**

- Que el dueño pueda **cambiar precios y marcar agotados por su cuenta**, tipo
  un Excel conectado en vivo, sin tener que llamarlo a él.
- Que la carta sea **mucho más espectacular**, con las mejores transiciones
  posibles, sin pagar un peso.
- Que se evalúe si pasar a **React** u otra tecnología, porque el HTML puro
  "se siente muy simple".
- Esta bitácora.

**Lo que se hizo**

1. Investigación con fuentes de 2025–2026 sobre licencias y *free tiers*
   (ver `docs/AUDITORIA-TECNICA.md` para el detalle y las fuentes).
2. Se detectó que **el repo está privado**, lo que bloquea GitHub Pages.
3. Se escribió la auditoría comparando stacks, fuentes de datos editables,
   librerías de animación y hosting.

**Conclusión corta de la auditoría:** no vale la pena React para esto. La
recomendación es **Astro + GSAP + Google Sheets**, por razones que están
argumentadas con números en la auditoría.

**Pendiente:** que Julián elija el camino antes de implementar.

---

## ✅ Decisiones tomadas (y por qué)

Estas ya están decididas. Si una se cambia, **anótalo aquí con la fecha y el
motivo**, no la borres.

| # | Decisión | Por qué |
|---|---|---|
| 1 | **QR estático**, nunca un "QR dinámico" de terceros | Los generadores dinámicos son gratis al principio y después cobran. Si caducan, los letreros impresos quedan inservibles. |
| 2 | El QR apunta a una **URL propia** | Permite cambiar el contenido sin reimprimir nada. |
| 3 | **Datos separados del código** (`menu-data.js`) | El dueño cambia un precio sin tocar el diseño. |
| 4 | **Precios con IVA incluido** | En Colombia el precio al consumidor se muestra con impuestos incluidos. |
| 5 | **Mobile-first**, sin scroll horizontal | Casi todos los clientes entran desde el celular. |
| 6 | **Estado "agotado"** por producto | En una panadería se agotan cosas durante el día. |
| 7 | Nada de **Hornitos** ni de ninguna marca ajena | Inspiración sí, copia no. |
| 8 | **No inventar** datos reales del negocio | Mejor un marcador evidente que un dato falso. |
| 9 | Google Fonts es el **único host externo** permitido | Todo lo demás debe funcionar aunque falle un CDN. |

---

## ❓ Decisiones pendientes

| # | Pregunta | Estado |
|---|---|---|
| A | ¿Stack de la v2: Astro, vanilla potenciado o React? | **Esperando a Julián.** Recomendación: Astro. |
| B | ¿Fuente de datos editable: Sheets horneado, en vivo o híbrido? | **Esperando a Julián.** Recomendación: híbrido. |
| C | ¿Seguir en GitHub Pages o pasar a Cloudflare Pages? | **Esperando.** Recomendación: GitHub Pages ahora, Cloudflare si crece. |
| D | ¿El repo se hace público? | 🔴 **Bloquea el lanzamiento.** Sin esto no hay Pages gratis. |
| E | ¿La panadería se llama **Zahara**? | El repo se llama `menu_zahara` pero la carta dice "Panadería El Horno" (nombre de muestra). |
| F | ¿Se construye un panel propio para marcar agotados? | Fase 3. Un Sheet en el celular funciona, pero botones grandes serían mejor. |

---

## 📦 Datos reales pendientes (los entrega Julián)

- [ ] Nombre real y logo de la panadería
- [ ] Colores / identidad visual
- [ ] Lista de productos con precios actuales
- [ ] Fotos propias de los productos (opcional)
- [ ] Dirección, horario y QR/enlace de domicilios o redes

---

## 🎯 Próximos pasos, en orden

1. **Hacer el repo público** y activar GitHub Pages. Sin esto nada más importa.
2. Probar el QR con varios celulares reales.
3. Que Julián elija stack y fuente de datos (decisiones A, B, C).
4. Montar el Google Sheet y conectarlo.
5. Reemplazar los datos de ejemplo por los reales.
6. Subir el nivel visual: fotos, tipografía, transiciones.
