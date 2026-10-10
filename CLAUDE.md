# Proyecto: Menú digital con QR para una panadería

Guárdame como `CLAUDE.md` en la raíz del repositorio. Claude Code me lee
automáticamente al inicio de cada sesión, así que sirvo de contexto permanente
y, la primera vez, de prompt de arranque.

> ⚠️ **Empieza por aquí.** La v1 del proyecto **ya está construida** (sesión del
> 9 de octubre de 2026). Este archivo describe *qué queremos y por qué*; lo que
> ya se hizo, lo que se decidió y lo que falta está en **[`BITACORA.md`](BITACORA.md)**.
> **Léela antes de tocar nada** y agrégale una entrada cuando termines.
> El análisis de stack, datos editables, animaciones y hosting está en
> [`docs/AUDITORIA-TECNICA.md`](docs/AUDITORIA-TECNICA.md).
>
> *(El prompt de arranque original que vivía en este bloque ya se cumplió; se
> quitó para que nadie reconstruya el proyecto desde cero por error.)*

---

## 1. Qué estamos haciendo y por qué

Una panadería **no tiene carta impresa**. Queremos un **menú virtual** al que
el cliente entre **escaneando un código QR** pegado en cada mesa. El menú debe
verse como una **revista digital que se pasa página a página** (efecto *flipbook*).

- **Dueño del proyecto:** Julián (estudiante de Ing. de Sistemas). El negocio es
  de un amigo suyo, en Colombia.
- **Público final:** clientes de la panadería, casi todos desde el **celular**,
  a veces con mala señal.
- **Trabajo del menú (una sola cosa):** que el cliente vea los productos,
  precios y disponibilidad de forma bonita y rápida.

## 2. Decisiones ya tomadas (respétalas)

- **Todo gratis.** Nada de plataformas de pago ni de servicios con "prueba
  gratis" que luego caduquen. En particular: el QR debe ser **estático** y
  apuntar a una URL propia que nosotros controlemos (GitHub Pages), **nunca** a
  un generador de "QR dinámico" de terceros.
- **Sin frameworks ni librerías externas.** HTML + CSS + JavaScript puro, en un
  solo `index.html`. Motivo: que cargue rápido con mala señal y no dependa de
  ningún CDN que pueda fallar. El efecto de pasar página se hace **a mano** con
  transformaciones CSS 3D (`rotateY` sobre el lomo izquierdo), no con librerías.
- **Hosting:** **GitHub Pages** (gratis). Opcional y a futuro: dominio propio.
- **Fuentes:** se pueden cargar desde Google Fonts (único host externo
  permitido). Usar display tipo *Fraunces* y cuerpo tipo *Karla*, con *fallback*
  del sistema por si no cargan.

## 3. Requisitos del menú (funcionales)

1. **Efecto revista (flipbook):** una página a la vez a pantalla completa; se
   pasa tocando los lados, deslizando (swipe) o con botones ‹ ›. Incluir también
   puntitos de navegación y soporte de teclado (← →).
2. **Mobile-first:** diseñado para ~400px de ancho. Nunca scroll horizontal.
   Respetar `prefers-reduced-motion` (bajar la animación si el usuario lo pide).
3. **Modo claro y oscuro:** definir TODOS los colores como variables (tokens) en
   `:root` y redefinir el set oscuro bajo `@media (prefers-color-scheme: dark)`.
   `body` siempre con fondo explícito desde un token.
4. **Datos separados del código:** los productos y precios van en un archivo
   aparte fácil de editar (`menu-data.js` o `menu.json`), NO incrustados en el
   HTML. El HTML lee de ahí y dibuja las páginas. Así el dueño cambia un precio
   en un minuto sin tocar el diseño.
5. **Estado de productos:** cada producto puede marcarse como **"Agotado"**
   (se muestra atenuado y sin precio) o con etiqueta **"Nuevo"**. Pensado para
   panadería, donde se agotan cosas a lo largo del día.
6. **Precios en COP con IVA incluido** (en Colombia el precio al consumidor debe
   mostrarse con impuestos incluidos). Formato con separador de miles.
7. **Estructura de páginas sugerida:** Portada → Panadería → Desayunos →
   Bebidas → Postres → Contraportada (horario, dirección y un recuadro para el QR
   de domicilios/redes).
8. **Descripciones cortas** opcionales por producto y, si aplica, mención de
   ingredientes/alérgenos.

## 4. Requisitos técnicos y de calidad

- **Imágenes (cuando las haya):** comprimir y servir en **WebP**, con `alt`
  descriptivo y `loading="lazy"`. Por ahora el menú va **solo con texto** (se ve
  limpio y pesa poco); dejar el código listo para añadir fotos después.
- **Accesibilidad:** foco visible en botones, `aria-label` en controles, buen
  contraste en ambos temas.
- **Rendimiento:** página ligera, sin dependencias pesadas.
- **Código limpio** y comentado donde ayude.

## 5. Entregables (crea estos archivos)

```
/
├── index.html          # el menú (flipbook, estilos y lógica)
├── menu-data.js         # SOLO los productos y precios, fácil de editar
├── assets/              # carpeta para fotos en WebP (vacía por ahora)
├── qr/                  # aquí guarda el PNG del QR generado
├── CLAUDE.md            # este archivo
└── README.md            # instrucciones para Julián y el dueño
```

### README.md debe explicar, en español y para alguien no técnico:
1. **Cómo editar productos y precios** (abrir `menu-data.js`, cambiar el texto,
   guardar, `git commit` + `git push`). Con un ejemplo concreto.
2. **Cómo marcar un producto como agotado o nuevo.**
3. **Cómo publicar en GitHub Pages** paso a paso (Settings → Pages → rama
   `main` / carpeta `/root`) y cuál es la URL final.
4. **Cómo se generó el QR** y cómo volver a generarlo si cambia la URL.
5. **Cómo añadir fotos** (meter el WebP en `assets/`, referenciarlo en
   `menu-data.js`).

## 6. El código QR

- Genera un **QR estático en PNG** que apunte a la URL de GitHub Pages del repo
  y guárdalo en `qr/`. Usa una herramienta local/offline (por ejemplo la
  librería `qrcode` de Python: `pip install qrcode[pil]`), **no** un servicio web.
- Hazlo en buena resolución para imprimir (≈1000×1000 px) y con buen margen
  (quiet zone). En el README recuerda: imprimirlo de **mínimo 3–4 cm**,
  plastificado o en soporte de acrílico, con un texto tipo *"Escanea para ver la
  carta"* y la URL corta escrita debajo. Y **probarlo con varios celulares**
  antes de imprimir todos.

## 7. Contenido de arranque (datos de EJEMPLO)

Mientras el amigo pasa sus productos y precios reales, llena `menu-data.js` con
productos típicos de panadería colombiana marcados claramente como muestra:
pandebono, almojábana, pan de queso, roscón con arequipe, caldo de costilla,
calentado, chocolate con queso, aguapanela, merengón, obleas con arequipe, etc.
Nombre de muestra para el negocio: **"Panadería El Horno"**. Precios inventados
en COP.

## 8. Reglas importantes

- **No copiar a Hornitos** (ni a ninguna marca): nos inspira su estilo de
  revista, pero NO usar su logo, sus textos, sus fotos ni su nombre. La identidad
  (nombre, colores, logo, fotos) es la de la panadería del amigo.
- **No inventar** datos reales del negocio (dirección, horario, precios): dejar
  marcadores claros hasta que Julián los entregue.
- Mantener el proyecto simple: es un menú, no una app.

---

### Estado al 9 de octubre de 2026

La carta está **publicada y funcionando**: https://jdgonzalezz2.github.io/menu_zahara/

> ⚠️ **Antes de tocar nada, lee [`BITACORA.md`](BITACORA.md).** Tiene la
> sección *"Cómo funciona la carta"*, que explica de dónde salen los datos,
> dónde se toca cada cosa y qué decisiones de implementación NO son obvias
> y no conviene deshacer sin saber por qué están.

**Lo que más falta, con diferencia: FOTOS.** 48 de 51 productos no tienen, y
ninguna dirección de arte arregla una carta de puro texto.

Datos del negocio:
- [x] Nombre: **Panadería Zahara**
- [x] Dirección: Cra. 59 #132A-36, Bogotá
- [x] Horario: 6:00 a.m. – 10:00 p.m.
- [x] Teléfono: **no tienen** (el de Google está desactualizado, no copiarlo)
- [x] Precios de los 11 combos de desayuno (reales, junio de 2025)
- [ ] 📸 Fotos de los productos
- [ ] 💵 Precios reales del resto (hoy son de muestra → la carta va con `noindex`)
- [ ] 🏷️ Logo e identidad visual
- [ ] 🍕 Carta de pizzería y frutería
