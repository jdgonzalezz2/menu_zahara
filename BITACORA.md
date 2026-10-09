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

**Dónde estamos:** 🟢 **La carta está EN VIVO y conectada al Google Sheet.**
https://jdgonzalezz2.github.io/menu_zahara/ — 6 páginas, 22 productos que
salen de la hoja del dueño, 7,1 KB gzip, servida desde Bogotá en ~145 ms.

**Qué funciona hoy**

- Flipbook de 6 páginas con giro 3D sobre el lomo izquierdo.
- Navegación: toque en los lados, swipe, botones ‹ ›, puntitos y teclado.
- Tema claro y oscuro automáticos.
- Productos con estado **nuevo** / **agotado** (el agotado sale sin precio).
- Precios en COP con separador de miles e IVA incluido.
- QR estático de 1000×1000 listo para imprimir.

**Qué NO funciona todavía**

- 🟡 **El QR no se ha probado con celulares reales.** La URL ya existe y
  responde, pero hay que escanearlo de verdad antes de mandar a imprimir.
- 🟡 Los productos, los precios y el nombre **siguen siendo de ejemplo**
  (ahora viven en el Sheet, que es lo importante).
- 🔴 **El Sheet todavía tiene los productos de EJEMPLO**, pero la carta ya
  dice "Panadería Zahara". Por eso está en modo borrador (`noindex`): no
  queremos que Google indexe precios inventados bajo el nombre de un negocio
  real con 555 reseñas. Se arregla pegando `docs/carta-zahara-junio-2025.csv`
  en el Sheet.
- 🟡 **Los precios que tenemos son de junio de 2025** (~16 meses). Hay que
  confirmarlos con el dueño antes de pegar un QR en las mesas.
- 🟡 Falta el salto visual: GSAP, page curl con WebGL, micro-interacciones.

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
| D | ¿El repo se hace público? | ✅ Hecho (sesión 4). Pages activo con *Source: GitHub Actions*. |
| E | ¿La panadería se llama **Zahara**? | 🟡 **Sin confirmar.** El repo y el Sheet dicen Zahara; la carta dice "El Horno". Es una línea en `src/config.js`. |
| F | ¿Se construye un panel propio para marcar agotados? | Fase 3. Un Sheet en el celular funciona, pero botones grandes serían mejor. |

---

### Sesión 4 — 9 de octubre de 2026 — *En vivo y conectada al Sheet*

Julián hizo el repo público, activó Pages con *Source: GitHub Actions* y creó
el Google Sheet.

**Verificado contra la hoja real** (ID `1GRbr40y…UIUI`, gid `1450287302`):

| Qué | Resultado |
|---|---|
| Lectura del Sheet | HTTP 200, 1475 B, 0,33 s |
| CORS desde GitHub Pages | ✅ `Access-Control-Allow-Origin` correcto |
| CORS desde localhost | ✅ también (refleja el origen que llegue) |
| Parseo | 4 secciones, 22 productos, 2 agotados y 2 nuevos |
| Build | `Origen de los datos: Google Sheet (4 secciones)` |
| Sitio en vivo | 200, 22 productos, ~145 ms desde Bogotá |

**Prueba de verdad del refresco en vivo.** No bastaba con ver que no fallara,
había que ver que *corrigiera*. Se adulteraron dos precios en el HTML ya
construido ($ 9.999 y $ 1.111), se sirvió esa versión y se abrió en un Chrome
real: **el navegador los corrigió solo a $ 2.500 y $ 2.000** leyendo del
Sheet. El esquema híbrido queda validado de punta a punta.

**Dos trampas que costaron un rato y conviene recordar:**

1. La pestaña del Sheet se llamaba `plantilla-carta`, no `Carta`. Se arregló
   de raíz: ahora se puede apuntar por **gid** (el número de la URL), que no
   cambia aunque renombren la pestaña. Si no hay gid ni nombre, se usa la
   primera.
2. `Intl.NumberFormat` separa el `$` del número con un **espacio duro
   (U+00A0)**, no un espacio normal. Buscar `"$ 2.500"` con un espacio
   corriente no encuentra nada. Si alguna vez hay que hacer grep o replace
   sobre precios, usar una expresión regular.

**Dato que cierra una pregunta abierta de la auditoría:** la cabecera
`X-Served-By: cache-bog-...-BOG` confirma que GitHub Pages sirve el sitio
**desde un nodo en Bogotá**. La duda sobre la latencia en Colombia queda
resuelta y, por ahora, no hay motivo para mudarse a Cloudflare.

---

### Sesión 5 — 9 de octubre de 2026 — *Llegan los datos reales del negocio*

Julián pasó la ficha de Google Maps y fotos del tablero de la pared.

**El negocio es Panadería Zahara**, Cra. 59 #132A-36, Bogotá. 4,5 ★ con 555
reseñas, con domicilio. El letrero dice *Panadería · Desayunos · Pizzería ·
Frutería*, así que es bastante más que una panadería y la carta va a tener
que crecer.

**Lo que se hizo**

- Nombre y dirección reales en `src/config.js`.
- `docs/carta-zahara-junio-2025.csv` con los 10 combos de desayuno leídos del
  tablero. El nombre del archivo lleva la fecha a propósito: **esos precios
  son de junio de 2025** y nadie debería olvidarlo.
- `src/data/menu-respaldo.json` pasa a tener los productos reales, para que
  no exista ningún escenario donde aparezcan productos inventados bajo el
  nombre de Zahara.
- **Modo borrador** (`BORRADOR` en `src/config.js`): mete `noindex, nofollow`
  mientras el Sheet siga con datos de ejemplo. Zahara es un negocio real con
  555 reseñas; que Google indexe precios inventados bajo su nombre sería un
  problema de verdad, no un detalle. Se apaga con una línea.

**Horario y teléfono NO se pusieron.** Google solo muestra "cierra a las
10 p.m." (falta apertura y días) y un teléfono "12855192" que parece el fijo
viejo de Bogotá, hoy `(601) 285 5192`. Es una inferencia, no un dato, así que
quedan como marcador. `CLAUDE.md` es explícito en no inventar datos del
negocio.

**Dudas del tablero, ya resueltas por Julián:**

| Combo | Qué se veía | Resolución |
|---|---|---|
| 2 (Tamal) | `11.500` y `13.300` apilados | Rige **13.300** (el más caro) |
| 4 (Changua) | `13.300` y `14.300` apilados | Rige **14.300** (el más caro) |
| 3 (Caldo) | Sticker `COSTILLA 14.000` / `PESCADO 15.000` | Son dos variantes → dos productos |

También confirmó que **los precios de junio de 2025 sirven tal cual**, que el
horario es **6:00 a.m. – 10:00 p.m.**, y que **la panadería ya no tiene
teléfono**: el número que sigue apareciendo en Google está desactualizado.
El campo se quitó del código, no se dejó como marcador. ⚠️ Que a nadie se le
ocurra "arreglarlo" volviéndolo a poner desde Google.

---

## 📦 Datos reales pendientes (los entrega Julián)

- [ ] Nombre real y logo de la panadería
- [ ] Colores / identidad visual
- [ ] Lista de productos con precios actuales
- [ ] Fotos propias de los productos (opcional)
- [ ] Dirección, horario y QR/enlace de domicilios o redes

---

## 🎯 Próximos pasos, en orden

1. **Confirmar el nombre real** de la panadería (¿Zahara?) y ponerlo en
   `src/config.js`.
2. **Probar el QR con celulares reales** antes de mandar a imprimir.
3. **Pasarle el Sheet al dueño** y que lo use un día real: que marque un
   agotado él mismo y vea si le resulta cómodo.
4. Reemplazar los productos y precios de ejemplo por los reales.
5. **El salto visual**: GSAP, page curl con WebGL, micro-interacciones.
6. Fotos de los productos en WebP.
7. Más adelante: panel `/panel` con botones grandes DISPONIBLE/AGOTADO.
