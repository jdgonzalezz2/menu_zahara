# Carta digital con QR — Panadería

Menú virtual que el cliente abre **escaneando un QR** pegado en la mesa. Se ve
como una revista: se pasa página por página en el celular.

- **El dueño cambia precios desde un Google Sheet**, sin tocar código ni llamar
  a nadie.
- **Carga rapidísimo** aunque la señal esté mala: 7 KB en total.
- **No cuesta nada**: GitHub Pages + Google Sheets, los dos gratis.
- **El QR nunca cambia**: aunque cambien los productos mil veces, el papelito
  impreso sigue sirviendo.

**URL del menú:** https://jdgonzalezz2.github.io/menu_zahara/

> ⚠️ **Dos cosas pendientes antes de que esto funcione de verdad:**
> 1. El repositorio está **privado**. GitHub Pages gratis solo publica repos
>    públicos → hay que hacerlo público (ver paso 1).
> 2. Los productos, precios y el nombre "Panadería El Horno" son **de ejemplo**.

---

## 🚀 Puesta en marcha (una sola vez)

### Paso 1 — Hacer el repositorio público

Sin esto nada más funciona.

1. En GitHub: **Settings** → **General**.
2. Hasta abajo, zona roja *Danger Zone* → **Change visibility** → **Make public**.

No hay riesgo: es una carta de panadería, no hay contraseñas ni datos de
clientes. Lo único que **nunca** debe subirse al repo es una llave de API.

### Paso 2 — Activar GitHub Pages

1. **Settings** → **Pages**.
2. En *Source* elige **GitHub Actions**.
   ⚠️ **No** elijas "Deploy from a branch": la carta ahora se construye con
   Astro y necesita el paso de build.
3. Listo. Cada vez que se suba un cambio, la carta se publica sola.

### Paso 3 — Crear el Google Sheet

1. Entra a [sheets.new](https://sheets.new) para crear una hoja nueva.
2. **Archivo → Importar → Subir** y sube el archivo
   [`docs/plantilla-carta.csv`](docs/plantilla-carta.csv) de este repo.
   Elige *Reemplazar hoja de cálculo*. Ya te quedan las columnas correctas y
   los productos de ejemplo.
3. La pestaña puede llamarse como sea: por defecto se lee **la primera**.
   (Si algún día la hoja tiene varias pestañas, pon el nombre exacto de la
   buena en `SHEET_HOJA`, en `src/config.js`.)
4. Arriba a la derecha: **Compartir** → en *Acceso general* elige
   **"Cualquier persona con el enlace"** con rol **Lector**.
   Sin esto, el sitio no puede leer la hoja.
5. Copia el **ID** de la hoja, que está en la URL:

   ```
   https://docs.google.com/spreadsheets/d/1AbC...XyZ/edit
                                           ^^^^^^^^^^^ esto
   ```

6. Pégalo en [`src/config.js`](src/config.js):

   ```js
   export const SHEET_ID = "1AbC...XyZ";
   ```

7. `git add . && git commit -m "Conecto el Sheet" && git push`

A los dos minutos la carta ya está leyendo del Sheet.

---

## 📊 Cómo el dueño cambia precios y marca agotados

**Él solo abre el Google Sheet** (desde el computador o desde la app en el
celular) y edita. Nada más.

> ### ⚠️ Lo que el Sheet puede y no puede hacer
>
> El Sheet manda sobre **el precio** y sobre **si algo se agotó**. Eso es lo
> que cambia a diario y tiene que poder cambiarse sin tocar código.
>
> El Sheet **NO** agrega, quita ni renombra productos. La carta —qué
> productos hay, cómo se llaman, qué incluyen y en qué orden van— vive en
> [`src/data/catalogo.json`](src/data/catalogo.json). Una fila nueva en el
> Sheet simplemente **se ignora**.
>
> Es a propósito: agregar un producto es una decisión de carta, y una carta
> no debería rediseñarse sola porque alguien escribió una fila.
>
> Para agregar o quitar productos, se le pide a Julián.

El enlace entre las dos cosas es **el nombre del producto**, que tiene que
coincidir con el del catálogo. Se comparan sin distinguir tildes, mayúsculas
ni espacios de más, así que `aromatica` encuentra `Aromática`. Si un nombre
no coincide con nada, el build lo avisa en el registro.

| Columna | ¿Sirve? |
|---|---|
| **Producto** | ✅ Es la llave. Tiene que coincidir con el catálogo |
| **Precio** | ✅ El número. Da igual `2500`, `2.500` o `$ 2.500` |
| **Estado** | ✅ Vacío, `nuevo` o `agotado` |
| Seccion | ❌ Se ignora: la sección la define el catálogo |
| Descripcion | ❌ Se ignora |
| Foto | ❌ Se ignora: las fotos van en `src/config.js` |

- `agotado` → el producto sale en gris, tachado y **sin precio**.
- `nuevo` → sale una insignia naranja.

### ¿En cuánto se ve el cambio?

- **Casi al instante** para el cliente que abra la carta después del cambio.
  La carta pide los precios frescos por detrás cada vez que alguien la abre.
- **Cada 15 minutos** se reconstruye el sitio completo.

Las dos cosas funcionan a la vez, a propósito: si Google falla o el cliente
tiene mala señal, la carta igual se ve con los últimos precios horneados.
**Nunca queda en blanco.**

## 💻 Para Julián: trabajar en el código

```bash
npm install     # una sola vez
npm run dev     # servidor local en http://localhost:4321/menu_zahara
npm test        # pruebas del lector del Sheet
npm run build   # genera dist/
```

### Estructura

```
src/
  config.js            ← SHEET_ID y datos del negocio. Lo que más vas a tocar.
  pages/index.astro    ← arma la carta; acá se lee el Sheet en el build
  layouts/Carta.astro  ← cabecera, escenario del libro y barra de navegación
  components/          ← Portada, Seccion, Producto, Contraportada
  lib/sheet.js         ← lee y parsea el Sheet (se usa en build Y en el navegador)
  lib/precio.js        ← formato de pesos colombianos
  scripts/flipbook.js  ← navegación + refresco en vivo (lo único que baja el cliente)
  styles/carta.css     ← todos los estilos y los tokens de color
  data/menu-respaldo.json ← datos de ejemplo, se usan si no hay Sheet
public/assets/         ← fotos en WebP
qr/                    ← el QR para imprimir y el script que lo genera
test/                  ← pruebas del parser
```

### Cómo decide de dónde saca los datos

- Si `SHEET_ID` está vacío → usa `src/data/menu-respaldo.json` (ejemplo).
- Si `SHEET_ID` tiene algo → lee el Sheet en el build.
  **Si el Sheet falla, el build se cae a propósito**, para que la versión que
  ya está publicada se quede como está en vez de publicar datos viejos en
  silencio.

---

## 📷 Cómo añadir fotos

### ⚠️ Antes que nada: las fotos tienen que ser propias

Las fotos de Google Maps **las tomaron los clientes**, no la panadería, y
Google se las acredita a quien las subió. Usarlas en la carta del negocio
—y más quitándoles el crédito— no es lo mismo que verlas en Maps.

Lo correcto y además más fácil: que el dueño saque **sus propias fotos** con
el celular. Un plato cerca de una ventana, sin flash, y listo. Van a quedar
mejor que una captura de Maps, que ya viene comprimida dos veces.

### El proceso

1. Pon la foto donde sea (el Escritorio sirve) y corre:

   ```bash
   pip install pillow      # una sola vez
   python scripts/preparar-foto.py  C:/Users/juli2/Desktop/combo1.jpg  combo-1
   ```

   El script hace todo solo: recorta al centro en **cuadrado**, redimensiona
   a 700×700, busca la mejor calidad que quepa en **80 KB**, borra los
   metadatos EXIF (que incluyen la ubicación GPS) y la guarda en
   `public/assets/combo-1.webp`.

   Cuadrado porque las fotos de comida cenitales casi siempre salen
   verticales y un recorte 3:2 les corta el plato. Si alguna necesita ser
   apaisada, `--ancha` la deja en 900×600.

   **Para las miniaturas de producto usa `--redonda`**: recorta en círculo
   con fondo transparente. Como los platos son redondos, el mesón desaparece
   y el plato queda flotando sobre el papel, que es el recurso de las cartas
   de revista. La carta le pone una sombra que sigue el contorno real.

   ```bash
   python scripts/preparar-foto.py  foto.jpg  combo-7  --redonda
   ```

   En la carta se ve como una **miniatura de 96×96** al lado del nombre. Se
   eligió así y no a todo el ancho porque una foto grande por producto haría
   las páginas larguísimas, y la gracia del flipbook es pasar páginas, no
   hacer scroll.

2. En el Google Sheet, escribe **`combo-1.webp`** en la columna **Foto** de
   ese producto.

3. `git add . && git commit -m "Foto del combo 1" && git push`

Las fotos se cargan solo cuando el cliente llega a esa página
(`loading="lazy"`), así que no vuelven lenta la carta.

---

## 🔲 El código QR

### Cómo se generó

Con la librería **`qrcode` de Python**, ejecutada **en el computador**, no en
una página web. Esto importa: los generadores de "QR dinámico" de internet son
gratis al principio y después cobran o dejan de funcionar, y te dejan los
letreros impresos inservibles. Este QR es **estático** y apunta directo a
nuestra URL, así que **sirve para siempre**.

Está en **`qr/menu-qr.png`** (1000×1000 px, listo para imprimir).

### Volver a generarlo (solo si cambia la URL)

```bash
pip install "qrcode[pil]"
python qr/generar-qr.py
python qr/generar-qr.py https://otra-url.com/   # si cambia el dominio
```

### Para imprimirlo bien

- Mínimo **3–4 cm** de lado. Más pequeño falla con cámaras malas.
- **No le quites el borde blanco**: el lector lo necesita.
- Plastificado o en soporte de acrílico — le va a caer harina, grasa y agua.
- Escribe debajo *"Escanea para ver la carta"* y la URL en letra pequeña.
- ⚠️ **Pruébalo con varios celulares antes de mandar a imprimir todos**:
  un Android viejo, un iPhone, con poca luz y la pantalla sucia.

---

## 🔧 Detalles técnicos

- **Astro** genera HTML estático. El cliente baja **~7 KB gzip en total**
  (HTML con el CSS incrustado + 2,3 KB de JavaScript). No hay framework de
  interfaz en el navegador.
- **El efecto de pasar página** está hecho a mano con `rotateY` sobre el lomo
  izquierdo y `perspective` en el contenedor. Cada hoja tiene cara frontal y
  trasera con `backface-visibility: hidden`.
- **Navegación**: tocar los lados, swipe, botones ‹ ›, puntitos y teclado
  (← → , Home, End).
- **Temas claro y oscuro**: todos los colores son variables en `:root`,
  redefinidas bajo `@media (prefers-color-scheme: dark)`.
- **Accesibilidad**: `aria-label` en los controles, foco visible y un
  `aria-live` que anuncia la página al cambiar.
- **`prefers-reduced-motion`**: si el usuario pide menos animación, el giro
  es casi instantáneo.
- **Lectura del Sheet**: se usa el endpoint `gviz`, no la API de Google.
  La API necesita llave y Google planea cobrar excedentes; `gviz` no necesita
  nada y manda cabeceras CORS, que es lo que permite el refresco en vivo.

### Una advertencia sobre la actualización automática

GitHub **desactiva los *schedules*** en repos públicos que llevan 60 días sin
actividad. Si un día la carta deja de actualizarse sola, casi seguro es eso:
se reactiva desde la pestaña **Actions** del repo. El refresco en vivo desde
el navegador sigue funcionando igual.

---

## ✅ Pendientes

- [ ] Hacer el repo público y activar Pages
- [ ] Crear el Google Sheet y pegar el `SHEET_ID`
- [ ] Nombre real y logo de la panadería
- [ ] Colores / identidad visual
- [ ] Lista de productos con precios reales
- [ ] Fotos propias de los productos (opcional)
- [ ] Dirección, horario y QR/enlace de domicilios o redes
