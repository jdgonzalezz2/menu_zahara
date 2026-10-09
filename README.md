# Carta digital con QR — Panadería

Menú virtual que el cliente abre **escaneando un QR** pegado en la mesa. Se ve
como una revista: se pasa página por página en el celular.

- **No necesita internet rápido**: es una sola página, sin librerías pesadas.
- **No cuesta nada**: se publica gratis en GitHub Pages.
- **El QR nunca cambia**: aunque cambies los productos cien veces, el papelito
  impreso sigue sirviendo.

**URL del menú:** https://jdgonzalezz2.github.io/menu_zahara/

> ⚠️ Ahora mismo los productos y precios son de **EJEMPLO**, igual que el nombre
> "Panadería El Horno". Hay que reemplazarlos por los reales.

---

## 📁 Qué hay en cada archivo

| Archivo | Para qué sirve | ¿Lo tocas? |
|---|---|---|
| `menu-data.js` | Los productos, precios, horario y dirección | **Sí, este es el tuyo** |
| `index.html` | El diseño y el funcionamiento del menú | No, salvo que quieras cambiar el diseño |
| `assets/` | Las fotos de los productos | Sí, si vas a poner fotos |
| `qr/menu-qr.png` | El código QR para imprimir | Solo si cambia la URL |
| `qr/generar-qr.py` | El programita que crea el QR | Casi nunca |

---

## 1. Cómo cambiar productos y precios

Todo está en **`menu-data.js`**. Ábrelo con cualquier editor de texto
(Bloc de notas sirve, pero es mejor VS Code).

Cada producto es una línea así:

```js
{ nombre: "Pandebono", precio: 2500, desc: "Clásico, suave por dentro." },
```

- **`nombre`** → el nombre que verá el cliente.
- **`precio`** → el número **sin puntos y sin `$`**. Escribe `2500`, no `$2.500`.
  El menú le pone los puntos solo y lo muestra como `$ 2.500`.
  Los precios se muestran **con IVA incluido**, como exige la ley en Colombia:
  pon el precio final que paga el cliente.
- **`desc`** → descripción corta. Opcional: puedes dejarla vacía `desc: ""`.

### Ejemplo concreto: subir el pandebono de $2.500 a $2.800

Buscas esta línea:

```js
{ nombre: "Pandebono", precio: 2500, desc: "Clásico, suave por dentro." },
```

y la dejas así:

```js
{ nombre: "Pandebono", precio: 2800, desc: "Clásico, suave por dentro." },
```

Guardas, y publicas (ver **punto 3**).

### Para agregar un producto nuevo

Copia una línea entera, pégala debajo y cámbiale el texto. **Cuida la coma `,`
al final** y las comillas `" "`.

```js
{ nombre: "Buñuelo", precio: 2000, desc: "Crocante por fuera." },
```

### Para quitar un producto

Borra la línea completa, de `{` hasta `},`.

> 💡 **Si algo se rompe** y el menú sale en blanco, casi siempre es una comilla
> o una coma que falta. Deshaz el último cambio (`Ctrl + Z`) y vuelve a intentar.

---

## 2. Cómo marcar un producto como **agotado** o **nuevo**

Se le agrega `etiqueta` al final del producto:

**Agotado** (se ve en gris, tachado y **sin precio**):

```js
{ nombre: "Tamal santafereño", precio: 10000, desc: "Fin de semana.", etiqueta: "agotado" },
```

**Nuevo** (sale una insignia naranja que dice NUEVO):

```js
{ nombre: "Roscón con arequipe", precio: 4500, desc: "Relleno generoso.", etiqueta: "nuevo" },
```

**Volver a lo normal**: borra la parte `, etiqueta: "agotado"` y ya.

> Esto está pensado para el día a día de la panadería: si se acabó el pan de
> queso a las 11 a.m., lo marcas agotado y el cliente no lo pide en vano.

---

## 3. Cómo publicar los cambios (GitHub Pages)

### La primera vez: activar GitHub Pages

1. Entra al repositorio en GitHub: https://github.com/jdgonzalezz2/menu_zahara
2. Arriba, pestaña **Settings** (Configuración).
3. En el menú de la izquierda, **Pages**.
4. En *Source* elige **Deploy from a branch**.
5. En *Branch* elige **`main`** y la carpeta **`/ (root)`**.
6. Dale **Save**.
7. Espera 1–2 minutos y recarga. GitHub te mostrará la dirección:

   **https://jdgonzalezz2.github.io/menu_zahara/**

Esa es la URL que lleva el QR. **No la cambies** después de imprimir los QR.

### Cada vez que cambies algo

Desde la carpeta del proyecto, en la terminal:

```bash
git add .
git commit -m "Subo precio del pandebono"
git push
```

En **1 o 2 minutos** el menú ya está actualizado para todos los clientes. No hay
que reimprimir nada.

> Si prefieres no usar la terminal: en GitHub puedes abrir `menu-data.js`, darle
> al lápiz ✏️ (*Edit this file*), cambiar el texto y abajo **Commit changes**.
> Funciona igual.

---

## 4. El código QR

### Cómo se generó

Con la librería **`qrcode` de Python**, ejecutada **en el computador** (no en una
página web). Esto importa: los generadores de "QR dinámico" de internet son
gratis al principio y después cobran o dejan de funcionar, y te dejan los
letreros impresos inservibles. Este QR es **estático** y apunta directo a nuestra
URL, así que **sirve para siempre**.

El archivo está en **`qr/menu-qr.png`** (1000×1000 px, listo para imprimir).

### Cómo volver a generarlo (solo si cambia la URL)

```bash
pip install "qrcode[pil]"
python qr/generar-qr.py
```

Y si la URL es otra (por ejemplo si algún día compras un dominio propio):

```bash
python qr/generar-qr.py https://panaderiaelhorno.com/
```

### Para imprimirlo bien

- Tamaño **mínimo 3–4 cm** de lado. Más pequeño falla con cámaras malas.
- **No le quites el borde blanco** alrededor: el lector lo necesita.
- Plastificado o en soporte de acrílico — en una panadería le va a caer harina,
  grasa y agua.
- Escribe debajo algo como **"Escanea para ver la carta"** y la URL en letra
  pequeña, por si alguien no puede escanear.
- ⚠️ **Pruébalo con varios celulares antes de mandar a imprimir todos**:
  un Android viejo, un iPhone, con poca luz y con la pantalla sucia.

---

## 5. Cómo añadir fotos

Por ahora el menú es **solo texto**: se ve limpio y carga rapidísimo incluso con
mala señal. Pero ya está listo para fotos.

1. **Convierte la foto a WebP** (pesa mucho menos que JPG). Puedes usar
   [Squoosh](https://squoosh.app/) — es gratis y funciona en el navegador.
   Apunta a que cada foto pese **menos de 100 KB**.
2. **Guárdala en la carpeta `assets/`** con un nombre sencillo, sin tildes ni
   espacios: `pandebono.webp`.
3. **Menciónala en `menu-data.js`** agregando `img`:

   ```js
   { nombre: "Pandebono", precio: 2500, desc: "Clásico.", img: "pandebono.webp" },
   ```

4. Guardas, `git push`, y listo.

Las fotos se cargan solo cuando el cliente llega a esa página (`loading="lazy"`),
así que no vuelven lento el menú.

---

## 6. Detalles técnicos (para Julián)

- **Sin frameworks ni librerías.** HTML + CSS + JS puro en un solo `index.html`.
  No depende de ningún CDN que pueda fallar con mala señal. Lo único externo son
  las fuentes de Google Fonts (*Fraunces* y *Karla*), y si no cargan hay
  *fallback* del sistema.
- **El efecto de pasar página** está hecho a mano con `rotateY` sobre el lomo
  izquierdo (`transform-origin: left center`) y `perspective` en el contenedor.
  Cada hoja tiene cara frontal y trasera con `backface-visibility: hidden`.
- **Navegación**: tocar los lados, swipe, botones ‹ ›, puntitos y flechas del
  teclado (← → , Home, End).
- **Temas claro y oscuro**: todos los colores son variables en `:root` y se
  redefinen bajo `@media (prefers-color-scheme: dark)`.
- **Accesibilidad**: `aria-label` en los controles, foco visible, y un
  `aria-live` que anuncia la página al cambiar.
- **`prefers-reduced-motion`**: si el usuario pide menos animación, el giro
  pasa a ser casi instantáneo.

---

## ✅ Pendientes (datos reales)

- [ ] Nombre real y logo de la panadería
- [ ] Colores / identidad visual
- [ ] Lista de productos con precios actuales
- [ ] Fotos propias de los productos (opcional)
- [ ] Dirección, horario y QR/enlace de domicilios o redes
