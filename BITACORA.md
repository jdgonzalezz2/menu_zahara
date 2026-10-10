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

## 📍 Estado actual (al 9 de octubre de 2026, fin del día)

🟢 **La carta está EN VIVO:** https://jdgonzalezz2.github.io/menu_zahara/

**12 páginas · 51 productos · ~10 KB la primera carga · servida desde Bogotá
en menos de 200 ms · 84 pruebas pasando.**

### Qué funciona

| | |
|---|---|
| Flipbook con giro 3D sobre el lomo izquierdo | ✅ |
| **La hoja sigue el dedo** al arrastrar, con luz que se mueve con la inclinación | ✅ |
| Toque en los lados, swipe, botones ‹ ›, puntitos y teclado (← → Home End) | ✅ |
| Tema claro y oscuro, redefinido entero | ✅ |
| **Cero scroll**: ninguna página se desborda de 500 px de alto en adelante | ✅ |
| Paginación automática y pareja de las secciones largas | ✅ |
| Precios en vivo desde el Google Sheet (build + refresco en el navegador) | ✅ |
| Estados **nuevo** / **agotado** (el agotado sale sin precio) | ✅ |
| Fotos recortadas en círculo que flotan sobre el papel | ✅ |
| Tablas compactas en panel terracota para bebidas | ✅ |
| QR estático de 1000×1000 listo para imprimir | ✅ |

### Qué NO está listo

- 🔴 **40 de los 51 precios son DE MUESTRA.** Solo los 11 combos de desayuno
  tienen precios reales (del tablero de la pared, junio de 2025). Panadería,
  bebidas y adicionales me los inventé yo para que la maqueta se pudiera
  presentar. **Por eso la carta está en `noindex`.**
- 🔴 **48 de 51 productos no tienen foto.** Es, de lejos, lo que más le falta:
  páginas enteras de texto y aire. Hay 5 fotos: 3 miniaturas, 1 de portada y
  1 de cabecera de sección.
- 🟡 **El QR nunca se ha escaneado con un celular real.**
- 🟡 **No hay logo.** La portada tiene su espacio reservado con una espiga.
- 🟡 **Faltan secciones enteras**: Zahara también es pizzería y frutería, y
  de eso no hay ni un dato.
- 🟡 Julián sigue diciendo que el estilo no lo termina de convencer. Se
  rehízo entero con lenguaje de revista impresa y quedó mucho mejor, pero
  el diagnóstico de fondo es que **sin fotos ninguna dirección de arte
  salva la carta**.

---

## ⚙️ Cómo funciona la carta

> Esta es la parte que hay que leer antes de tocar nada.

### De dónde salen los datos

Hay **dos fuentes** y cada una manda sobre cosas distintas. No es un
capricho: es lo que permite que el dueño cambie precios sin tocar código, y
que al mismo tiempo la carta no se desordene sola.

```
src/data/catalogo.json          Google Sheet (del dueño)
  QUÉ productos hay               CUÁNTO cuesta cada uno
  cómo se llaman                  si se AGOTÓ
  qué incluyen
  en qué sección van
  en qué orden
         │                               │
         └───────────┬───────────────────┘
                     ▼
        src/lib/precios.js  →  aplicarPreciosDelSheet()
          Cruza los dos por el NOMBRE del producto
          (sin distinguir tildes, mayúsculas ni espacios)
                     ▼
              La carta publicada
```

**Una fila nueva en el Sheet NO crea un producto.** Se ignora, y el build lo
avisa en el registro — que casi siempre significa un nombre mal escrito.
Agregar productos es pedido expreso de Julián, por decisión suya.

### Cuándo se actualiza

Dos mecanismos a la vez, a propósito:

1. **En el build** (`src/pages/index.astro`): se lee el Sheet y los precios
   quedan horneados dentro del HTML. Por eso la carta carga al instante y
   funciona aunque Google se caiga o el cliente tenga mala señal.
2. **En el navegador del cliente** (`src/scripts/flipbook.js`): ya con la
   carta visible, pide los precios frescos con 2,5 s de tiempo límite y
   actualiza precios y agotados en caliente. **Si falla, falla en silencio**
   y se queda lo horneado. Nunca deja la carta en blanco.

El sitio se reconstruye en cada push, cada 15 minutos y a mano, desde
`.github/workflows/deploy.yml`.

⚠️ Si hay `SHEET_ID` configurado y el Sheet no se puede leer, **el build se
cae a propósito**. Es preferible que la versión publicada se quede como está
a publicar datos viejos en silencio.

### Cómo se arman las páginas

`src/lib/paginar.js` parte cada sección en páginas de máximo
`MAX_PRODUCTOS_POR_PAGINA` (5), o `MAX_COMPACTO` (12) si es una tabla
compacta. El reparto es **parejo**: con 7 productos salen páginas de 4 y 3,
no de 6 y 1, porque una página con un solo producto se ve rota.

Orden final: Portada → páginas de carta → Contraportada.

### Dónde se toca cada cosa

| Quiero… | Archivo |
|---|---|
| Agregar, quitar o renombrar un producto | `src/data/catalogo.json` |
| Cambiar un precio o marcar agotado | **El Google Sheet** |
| Cambiar nombre, dirección u horario | `src/config.js` → `NEGOCIO` |
| Asociar una foto a un producto | `src/config.js` → `FOTOS` |
| Foto de cabecera de una sección | `src/config.js` → `FOTOS_SECCION` |
| Que una sección salga como tabla | `src/config.js` → `SECCIONES_COMPACTAS` |
| Cuántos productos por página | `src/config.js` → `MAX_PRODUCTOS_POR_PAGINA` |
| Quitar el `noindex` | `src/config.js` → `BORRADOR = false` |
| Colores, tipografía, maquetación | `src/styles/carta.css` |
| Preparar una foto nueva | `python scripts/preparar-foto.py foto.jpg nombre --redonda` |

### Decisiones de implementación que NO son obvias

Estas costaron y conviene no deshacerlas sin saber por qué están:

- **El `z-index` de las hojas y la luz del giro los escribe el JS en línea**,
  no el CSS. Mezclar las dos fuentes no funciona: cuando el valor pasa de
  estar en línea, durante el arrastre, a venir de una clase, la transición
  no arranca y la sombra se queda congelada a mitad de camino.
- **Nada de `transform-style: preserve-3d` en `.book`.** Crearía un contexto
  3D donde los hijos se ordenan por posición y se ignora el `z-index`, que
  es justo con lo que se apilan las hojas.
- **La sombra de las fotos es `filter: drop-shadow`, no `box-shadow`.** Las
  fotos están recortadas en círculo con fondo transparente; `box-shadow`
  dibujaría la sombra de un cuadrado invisible.
- **El scroll lo hace `.face-scroll`, no `.face`.** Así la luz del giro y el
  grano del papel se quedan quietos en vez de irse con el texto.
- **Los espaciados y tamaños van en `vh`**, no en píxeles. Es lo que hace que
  la página siempre quepa: en un celular bajito todo se aprieta un poco en
  vez de desbordarse.
- **`.cover` usa `height: 100%`, no `min-height`.** Con `min-height` el
  contenedor crece hasta el tamaño natural de la foto en vez de dejarla
  encoger, y la portada se sale de la pantalla.

### Trampas del entorno (ya costaron tiempo dos veces)

- **Chrome headless en Windows no baja de 500 px de ancho** e ignora
  `--window-size` menores. Las capturas parecen tener un bug de maquetación
  y es puro artefacto. Medir `window.innerWidth` antes de creerle a una
  captura.
- **`--virtual-time-budget` no hace avanzar las transiciones del hilo
  principal**, aunque las del compositor sí. Da falsos positivos de
  "animación congelada". Para verificar una animación, congelar un estado
  estático en vez de medir el final de una transición.
- **`Intl.NumberFormat` separa el `$` del número con un espacio duro
  (U+00A0)**, no uno normal. Buscar `"$ 2.500"` con un espacio corriente no
  encuentra nada.
- **`BASE_URL` de Astro viene SIN barra final.** Pegar cadenas a mano produce
  `/menu_zaharaassets/foto.webp`. Para eso está `src/lib/rutas.js`.

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

### Sesión 6 — 9 de octubre de 2026 — *Fotos y paginación*

Llegaron las primeras fotos reales del negocio, tomadas por ellos.

- `scripts/preparar-foto.py`: recorta, redimensiona, baja la calidad por
  pasos hasta caber en 80 KB y **borra los metadatos EXIF**, que incluyen la
  ubicación GPS y no tienen por qué acabar publicados.
- El formato por defecto pasó a **cuadrado**. Se probaron los dos: un recorte
  3:2 de una foto cenital vertical corta el plato y queda como un primer
  plano accidental.
- En la carta van como **miniatura al lado del nombre**, no a todo el ancho:
  con 11 productos, una foto grande por cada uno dejaba la página kilométrica.
- **Paginación automática** (`src/lib/paginar.js`): las secciones largas se
  parten solas, con reparto parejo. Probado de 1 a 40 productos.

**Un bug de maquetación que costó:** con grid, la miniatura abarcaba las dos
filas, cada una crecía a la mitad de la altura y quedaba un hueco entre el
nombre y la descripción. Se resolvió envolviendo el texto en `.item-texto` y
centrándolo como bloque con flex.

---

### Sesión 7 — 9 de octubre de 2026 — *Dirección de arte*

Julián pasó un brief de director de arte. Se aplicó al formato del proyecto,
no al A4 que pedía el brief: esta carta es digital y se abre por QR, que es
justo el punto del proyecto.

- Paleta, tipografía Fraunces con el eje **SOFT**, espiga de trigo en SVG
  inline, grano de papel, portada con foto principal y espacio para el logo.
- Las dos fotos que no correspondían a ningún producto pasaron a ser
  **material editorial**: el croissant encabeza la portada y el café encabeza
  Bebidas calientes.

**Dos bugs encontrados controlando:**

1. `BASE_URL` viene sin barra final, así que salía
   `/menu_zaharaassets/foto.webp`. La portada daba 404 y las fotos de
   producto habrían dado 404 también. Se extrajo a `src/lib/rutas.js`.
2. La portada se salía de la pantalla: tenía `min-height: 100%` sin máximo,
   así que crecía hasta los 700 px naturales de la foto.

**Un error de método, mío:** mandé capturas con las fotos inyectadas a mano y
las presenté como si fueran el sitio. Julián lo notó ("solo veo una de las
cuatro"). Una captura tiene que mostrar lo que existe. Desde entonces, cuando
es vista previa, se dice.

De ahí salió un cambio de diseño correcto: **las fotos pasaron del Sheet al
código**, porque meter una foto exige correr un script y hacer commit; es
trabajo de Julián, no del dueño.

---

### Sesión 8 — 9 de octubre de 2026 — *Catálogo completo y tabla compacta*

- **Tabla compacta** para bebidas y adicionales: caben 12 renglones por
  página en vez de 5, y a partir de 400 px pasa a dos columnas.
- **Catálogo completo de maqueta**: 51 productos en 5 secciones. Julián
  aclaró que la carta es una maqueta para presentar, no la definitiva.
- Se reactivó `BORRADOR` (`noindex`): 40 de los 51 precios son de muestra y
  Zahara es un negocio real con 555 reseñas en Google.

**Un reclamo justo:** Julián pidió la carta completa y con el Excel enlazado,
y yo le respondí "te falta un paso". Eran compatibles. (Ese mecanismo se
reemplazó después, en la sesión 10, por uno mejor.)

**También metí la pata en las pruebas:** dos inserciones fallaron en silencio
por el escapado y reporté "61 OK" sin notar que las pruebas nuevas no
existían. Ahora se insertan verificando que hayan quedado.

---

### Sesión 9 — 9 de octubre de 2026 — *La hoja sigue al dedo*

Primero, una corrección de algo que yo había prometido: **el page curl con
WebGL no es viable**. Para deformar la página con un shader hay que
convertirla en textura, y eso exige rasterizar el DOM. `html2canvas` pesa
~200 KB, rompe fuentes y renderiza mal el texto. Se pagaría muchísimo peso
por algo peor que lo que ya hay. **GSAP tampoco hacía falta.**

Lo que sí da el salto, y es nativo:

- **Arrastre**: la hoja gira en tiempo real siguiendo el dedo. Al soltar,
  completa el giro o se devuelve.
- Pasa con más del 30% de recorrido, o con un flick rápido **que además haya
  recorrido un 12%**. Sin esa segunda condición, un temblor de 30 px daba una
  velocidad altísima y pasaba página sola. Se cazó simulando gestos.
- **Luz** sobre la hoja, que se mueve con la inclinación.

Costo total: **438 bytes**, sin librerías.

**Lo que más costó:** la luz se intentó con `@property --giro` y `calc()`, y
no es fiable. Y medirlo con `--virtual-time-budget` daba falsos positivos.
La verificación buena fue congelar la hoja a mitad de giro con el dedo
encima: `rotateY(-63.75deg)` con opacidad `0.32`, o sea 35,4% x 0,9.

---

### Sesión 10 — 9 de octubre de 2026 — *Estilo de revista y cero scroll*

**1. Quitar la animación de entrada.** Julián reportó que en el celular "se
recargan" los productos al pasar de página. Era una entrada escalonada que yo
había agregado, y se volvía a disparar cada vez que una página pasaba a ser
la actual. Tiene razón en el fondo: **en una revista, lo de la página 1 ya
está en la página 1**. La animación es el giro de la hoja, no el contenido.

**2. El catálogo manda; el Sheet solo pone precios.** Ver *Cómo funciona la
carta*, arriba. `src/lib/combinar.js` se retiró y `menu-respaldo.json` pasó a
llamarse `catalogo.json`, que es lo que es.

**3. Estilo de revista impresa.** Julián dijo que el diseño se veía *aburrido
y genérico*, y tenía razón: crema + café + terracota es LA paleta por defecto
de "panadería artesanal". Se le mostraron tres direcciones alternativas y
pidió el lenguaje de la carta de Hornitos.

Se tomó su **lenguaje de composición, no sus activos**; `CLAUDE.md` permite
lo primero y prohíbe lo segundo:

- Fondo de madera hecho con degradados, sin imagen y sin petición de red. El
  primer intento quedó a rayas de código de barras; el truco fue que las
  franjas entren y salgan con transición suave y en anchos irregulares.
- Sin líneas separadoras ni puntitos guía: los productos flotan.
- El precio va **debajo** del nombre, pequeño, no en columna de contabilidad.
- Títulos de sección en mayúsculas terracota.
- **Panel sólido terracota** para las tablas de bebidas.

**4. Cero scroll**, pedido expreso. Eran dos problemas: la barra visible y el
contenido que no cabía. Se midió primero: a 780 px de alto una página se
desbordaba 47 px, y a 540 se desbordaban cinco. Arreglos:

- Ritmo vertical en `vh`, no en píxeles.
- 5 productos por página en vez de 6.
- La nota de IVA se repetía en las 12 páginas; va una sola vez.
- Las páginas de continuación llevan encabezado reducido.

**Resultado medido: de 500 px de alto en adelante, ninguna de las 12 páginas
se desborda, y la barra mide 0 px.**

---

## ✅ Decisiones tomadas (y por qué)

Estas ya están decididas. Si una se cambia, **anótalo aquí con la fecha y el
motivo**, no la borres.

| # | Decisión | Por qué |
|---|---|---|
| 1 | **QR estático**, nunca un "QR dinámico" de terceros | Los generadores dinámicos son gratis al principio y después cobran. Si caducan, los letreros impresos quedan inservibles. |
| 2 | El QR apunta a una **URL propia** | Permite cambiar el contenido sin reimprimir nada. |
| 3 | **Datos separados del código** | El dueño cambia un precio sin tocar el diseño. Desde la sesión 10: el catálogo vive en `catalogo.json` y el Sheet solo manda precios y agotados. |
| 4 | **Precios con IVA incluido** | En Colombia el precio al consumidor se muestra con impuestos incluidos. |
| 5 | **Mobile-first**, sin scroll horizontal | Casi todos los clientes entran desde el celular. |
| 6 | **Estado "agotado"** por producto | En una panadería se agotan cosas durante el día. |
| 7 | Nada de **Hornitos** ni de ninguna marca ajena | Inspiración sí, copia no. |
| 8 | **No inventar** datos reales del negocio | Mejor un marcador evidente que un dato falso. |
| 9 | Google Fonts es el **único host externo** permitido | Todo lo demás debe funcionar aunque falle un CDN. |
| 10 | **Sin librerías de animación.** El arrastre es nativo | GSAP pesa ~23 KB y el page curl con WebGL exige rasterizar el DOM (~200 KB, rompe fuentes). Lo que da el salto es que la hoja siga al dedo, y eso cuesta 438 bytes. |
| 11 | **El `z-index` y la luz del giro los escribe el JS**, no el CSS | Mezclar las dos fuentes rompe la transición: el valor se queda congelado a mitad de camino. |
| 12 | **La fuente de verdad de los productos es el código** | Agregar un producto es una decisión de carta. Una carta no se rediseña sola porque alguien escriba una fila en una hoja de cálculo. |
| 13 | **Espaciados en `vh`, no en píxeles** | Es lo que hace que la página siempre quepa y la carta nunca se scrollee. |
| 14 | **`noindex` mientras haya precios de muestra** | Zahara es un negocio real con 555 reseñas. Que Google indexe precios inventados bajo su nombre sería un problema de verdad. |

---

## ❓ Decisiones pendientes

| # | Pregunta | Estado |
|---|---|---|
| A | Stack de la v2 | ✅ **Astro**. |
| B | Fuente de datos editable | ✅ Híbrido; desde la sesión 10 el Sheet solo manda precios. |
| C | GitHub Pages o Cloudflare | ✅ **GitHub Pages**. Sirve desde Bogotá en menos de 200 ms; no hay motivo para mudarse. |
| D | Repo público | ✅ Hecho. |
| E | ¿La panadería se llama Zahara? | ✅ Confirmado. |
| F | Panel propio para marcar agotados | 🟡 Fase 3. Hoy se hace desde el Sheet. |
| G | Dominio propio | 🟡 Es lo único del proyecto que costaría plata. Verificado: si se compra después, GitHub deja la URL vieja redirigiendo con 301, así que los QR impresos seguirían sirviendo. Decidir **antes** de imprimir en serio. |
| H | ¿El estilo ya convence? | 🟡 Mejoró mucho con el lenguaje de revista, pero el diagnóstico de fondo es que **sin fotos ninguna dirección de arte salva la carta**. |

---

## 📦 Datos reales pendientes (los entrega Julián)

- [x] **Nombre:** Panadería Zahara
- [x] **Dirección:** Cra. 59 #132A-36, Bogotá
- [x] **Horario:** 6:00 a.m. – 10:00 p.m.
- [x] **Teléfono:** no tienen. ⚠️ El número que sigue apareciendo en Google
      está desactualizado — que a nadie se le ocurra "arreglarlo" copiándolo
      de ahí.
- [x] **Precios de los 11 combos de desayuno** (tablero, junio de 2025)
- [ ] 📸 **Fotos de los productos** ← lo más importante que falta
- [ ] 💵 Precios reales de panadería, bebidas y adicionales
- [ ] 🏷️ Logo e identidad visual
- [ ] 🍕 Carta de pizzería y frutería
- [ ] 📱 Redes o enlace de domicilios (hay un recuadro reservado en la
      contraportada)

---

## 🎯 Próximos pasos, en orden

1. 📸 **FOTOS. Es lo único que de verdad importa ahora.** 48 de 51 productos
   no tienen. Pedirle al dueño una foto de cada producto de la vitrina, con
   el celular, cerca de una ventana y sin flash. Diez minutos suyos cambian
   la carta más que cualquier otra cosa.
   Procesarlas con `python scripts/preparar-foto.py foto.jpg nombre --redonda`
   y registrarlas en `FOTOS`, dentro de `src/config.js`.
2. 💵 **Precios reales** de panadería, bebidas y adicionales. Hoy son de
   muestra. Van en el Google Sheet.
3. 📱 **Escanear el QR con celulares reales** antes de imprimir nada.
4. 🔓 **Quitar el `noindex`** (`BORRADOR = false`) cuando 1 y 2 estén listos.
5. 🏷️ **Logo**, si existe. Ya tiene su espacio reservado en la portada.
6. 🍕 **Las secciones que faltan**: pizzería y frutería. Hacen falta fotos de
   esos tableros, como la que se usó para sacar los combos.
7. 🖐️ **Pasarle el Sheet al dueño** y que lo use un día real: que marque un
   agotado él mismo y ver si le resulta cómodo. Es lo único que no podemos
   verificar nosotros.
8. 🎛️ Más adelante: página `/panel` con botones grandes DISPONIBLE/AGOTADO.
