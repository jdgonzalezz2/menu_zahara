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

**Dónde estamos:** **v2 construida en Astro y subida a GitHub.** Carta tipo
revista de 6 páginas, lista para leer los productos de un Google Sheet.
Pesa 7,1 KB gzip.

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
- 🟡 **Falta crear el Google Sheet** y pegar su ID en `src/config.js`.
  Mientras tanto la carta usa `src/data/menu-respaldo.json`.
- 🟡 El **refresco en vivo** está implementado pero **no probado contra un
  Sheet real**. Si falla, no rompe nada: queda lo horneado en el build.
- 🟡 Los productos, los precios y el nombre son **de ejemplo**.

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

### Sesión 3 — 9 de octubre de 2026 — *Migración a Astro y conexión al Sheet*

Julián eligió: **Astro**, esquema **híbrido** de datos, y arrancar por el
Google Sheet.

**Lo que se hizo**

1. **Migración a Astro 7.** La carta se partió en componentes
   (`Portada`, `Seccion`, `Producto`, `Contraportada`) con un layout común.
   Las páginas se renderizan **en el build**, así que el navegador ya no baja
   JavaScript para construir el DOM, solo para navegar.
2. **Lector del Google Sheet** (`src/lib/sheet.js`), compartido entre el build
   y el navegador: parser de CSV propio (aguanta comas y comillas dentro de
   las celdas), lectura tolerante de precios (`2500`, `2.500`, `$ 2.500`) y
   normalización de encabezados y estados.
3. **22 pruebas** en `test/sheet.test.mjs`, sin red. Corren con `npm test` y
   también en el workflow antes de publicar.
4. **GitHub Action** que construye y publica: en cada push, cada 15 minutos y
   a mano.
5. Plantilla `docs/plantilla-carta.csv` para crear el Sheet en un minuto.
6. Se eliminaron `index.html` y `menu-data.js` de la v1 (quedan en el
   historial de git).

**Resultado medido:** el cliente baja **7,1 KB gzip** en total, contra los
9,6 KB de la v1. Quedó más ordenado **y** más liviano, porque la construcción
del DOM se fue al build. Para comparar, React vacío son ~45 KB.

**Hallazgo técnico importante (CORS).** Hay dos formas de leer un Sheet y solo
una sirve para el refresco en vivo:

- `pub?output=csv` (publicar en la web) **redirige a `googleusercontent.com`
  sin cabeceras CORS** → el navegador lo bloquea. Sirve en el build, no en vivo.
- `gviz/tq?tqx=out:csv` sí manda CORS → **es el que usamos**.
- La API oficial de Sheets necesita llave y Google planea cobrar excedentes
  en 2026 → descartada.

Por eso el refresco en vivo está escrito para **fallar en silencio**: si no
funciona, la carta se queda con los datos horneados y no pasa nada. Esta parte
**todavía no se ha probado contra un Sheet real** — hay que verificarla cuando
exista.

**Decisión de diseño que vale recordar:** si hay `SHEET_ID` configurado y el
Sheet no se puede leer, **el build se cae a propósito**. Es preferible que la
versión ya publicada se quede como está, a publicar datos viejos en silencio.

**Nota de entorno:** Astro 7 pide Node ≥ 22.19 y la máquina de Julián tiene
22.13. El build funciona igual, pero npm avisa. Si algo se rompe raro, esa es
la primera sospecha.

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
| A | ¿Stack de la v2? | ✅ **Astro** (sesión 3). |
| B | ¿Fuente de datos editable? | ✅ **Híbrido**: Sheet horneado en el build + refresco en vivo (sesión 3). |
| C | ¿GitHub Pages o Cloudflare Pages? | 🟡 GitHub Pages por ahora. Revisar si hace falta repo privado o funciones de servidor. |
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

1. **Hacer el repo público** y poner Pages en *Source: GitHub Actions*.
   Sin esto nada más importa.
2. **Crear el Google Sheet** con `docs/plantilla-carta.csv` y pegar el ID en
   `src/config.js`. Instrucciones paso a paso en el README.
3. **Verificar el refresco en vivo** contra el Sheet real: abrir la carta,
   cambiar un precio en el Sheet, recargar y ver si cambia sin esperar el
   build. Si CORS lo bloquea, el plan B es un Worker de Cloudflare que haga
   de intermediario.
4. Probar el QR con varios celulares reales.
5. Reemplazar los datos de ejemplo por los reales.
6. Subir el nivel visual: fotos, GSAP, page curl con WebGL.
