# Auditoría técnica — octubre de 2026

Evaluación de las opciones para la v2 de la carta: stack, fuente de datos
editable por el dueño, animaciones y hosting. Todo con la restricción de
`CLAUDE.md`: **$0, nada que caduque, y que cargue rápido con mala señal.**

---

## 0. 🔴 Hallazgo bloqueante

**El repositorio está privado.** GitHub Pages en cuenta gratuita **solo
publica repositorios públicos**. Mientras siga privado:

- la URL `https://jdgonzalezz2.github.io/menu_zahara/` no existe,
- el QR generado no lleva a ninguna parte.

**Arreglo:** Settings → General → abajo del todo → *Change visibility* →
Public. (O GitHub Pro, pero eso rompe la regla de los $0.)

¿Hay problema en que el código sea público? No. Es una carta de panadería: no
hay secretos, ni contraseñas, ni datos de clientes. Lo que **nunca** debe
entrar al repo es una llave de API o un token.

---

## 1. ¿React, Astro o seguir en HTML puro?

Tu intuición es *"el HTML nativo se siente muy simple"*. Vale la pena separar
dos cosas que se mezclan en esa frase:

1. **¿Se ve simple la carta?** → eso lo arregla el diseño, no el framework.
2. **¿Es incómodo el código?** → eso sí es real, y tiene solución.

### El dato que decide

El peso de JavaScript que baja el celular del cliente **antes** de escribir
una sola línea de la carta:

| Stack | JS al cliente (gzip) | ¿Build? | Animaciones |
|---|---|---|---|
| **Actual** (1 archivo, vanilla) | ~3 KB | No | CSS 3D |
| **Vanilla + GSAP** | ~26 KB | No | Todo GSAP |
| **Astro** (islas opcionales) | **0 KB por defecto** | Sí | GSAP + View Transitions |
| **React + Vite** | ~45 KB | Sí | GSAP, peleando con el ciclo de render |
| **Next.js** | ~90 KB+ | Sí | Igual que React |

Para comparar: **la carta completa de hoy pesa 25 KB, incluyendo el contenido.**
React costaría casi el doble que todo el proyecto actual, antes de hacer nada.

### El punto clave

**El framework no produce las animaciones.** Las produce GSAP, CSS y WebGL,
que funcionan exactamente igual en los cinco casos de la tabla. No existe
ninguna transición que React pueda hacer y vanilla no.

De hecho, para animaciones imperativas con líneas de tiempo (que es justo lo
que necesita un page-curl), **React estorba**: toca sincronizar `useRef`,
`useLayoutEffect` y el reconciliador para que no pise la animación.

React brilla en interfaces con mucho estado: un carrito, filtros cruzados, un
panel de administración. Una carta que se pasa página por página tiene
prácticamente un solo dato de estado: *en qué página vas*.

### Lo que de verdad va a hacer la carta espectacular

En orden de impacto real:

1. **Fotos buenas** — esto solo es más de la mitad del efecto. Sin fotos,
   ningún framework salva la carta.
2. **Tipografía, espaciado y color** — es lo que separa "plantilla" de "marca".
3. **El efecto de pasar página** — un *page curl* con WebGL (curvatura real
   del papel, sombra que se dobla) es de otro nivel frente al `rotateY` actual.
4. **Micro-interacciones** — el precio que entra con un pequeño retraso, el
   sello de AGOTADO que cae con rebote, el nombre que se revela letra por letra.

Ninguno de los cuatro depende de React.

### Recomendación: **Astro**

Astro resuelve tu incomodidad real (tener todo en un archivo gigante) sin
pagar el costo de React:

- Escribes en **componentes** (`Portada.astro`, `Seccion.astro`, `Producto.astro`),
  se siente ordenado y moderno.
- **Genera HTML estático y manda 0 KB de JavaScript** por defecto. Solo baja
  JS donde tú digas.
- Puede **traer los datos del Google Sheet en el momento del build**, que es
  exactamente lo que necesitamos.
- Si algún día quieres React para una parte concreta (un panel de admin), lo
  metes como **isla** en esa página y solo ahí.
- Trae **View Transitions** integradas.
- Gratis, y despliega en GitHub Pages o Cloudflare Pages sin pagar.

**Costo honesto de Astro:** aparece `node_modules`, un `package.json` y un
paso de build. Si lo que quieres es poder abrir un archivo y editarlo sin más,
el vanilla actual es más simple. Pero como el dueño va a editar desde un
**Excel**, no desde el código, ese costo casi no se siente.

---

## 2. El "Excel en vivo" — que el dueño cambie precios sin llamarte

Esta es la parte más valiosa de todo lo que pediste, y tiene buenas soluciones
gratis.

### ⚠️ Antes que nada: hay dos Google Sheets, y no son lo mismo

| Camino | Necesita llave | Cuotas | ¿Sirve? |
|---|---|---|---|
| **API de Google Sheets** | Sí, API key | 300 lecturas/min por proyecto, 60/min por usuario. Google planea **cobrar los excedentes más adelante en 2026**. | ❌ Evitar |
| **Publicar en la web → CSV** | No | Sin cuota publicada. Es una URL pública normal. | ✅ **Usar este** |

Esta distinción es justo la clase de trampa contra la que advierte
`CLAUDE.md`: lo gratis que después cobra. El camino de *Publicar en la web* no
pasa por la API ni por facturación.

### Opciones comparadas

| Opción | El dueño usa | Costo | Demora en verse | Riesgo |
|---|---|---|---|---|
| Sheets CSV leído en vivo | Google Sheets | $0 | Segundos | Si Google falla, no hay datos |
| Sheets + GitHub Actions | Google Sheets | $0 | 5–10 min | Ninguno en runtime |
| **Híbrido** ⭐ | Google Sheets | $0 | Instantáneo | Ninguno |
| Airtable | Airtable | Free tier | Instantáneo | El free tier puede cambiar |
| Supabase | Panel propio | Free tier | Instantáneo | Pausa proyectos inactivos |
| Decap / Tina CMS | Un CMS web | $0 | 1–2 min | Más técnico que un Excel |
| Cloudflare D1 + Workers | Panel propio | $0 (100k req/día) | Instantáneo | Hay que construir el panel |

**Google Sheets gana por una razón que no es técnica: el dueño ya sabe usar
Excel.** Un CMS, por bonito que sea, es una herramienta nueva que hay que
enseñarle. Una hoja de cálculo con las columnas `Producto | Precio | Estado`
no necesita explicación.

### ⭐ Arquitectura recomendada: híbrida

```
   Google Sheet  ──────────────────────────────┐
   (el dueño edita desde el celular)           │
          │                                    │
          │ 1. GitHub Action, cada 10 min      │ 3. El navegador del cliente
          │    lee el CSV y hornea los datos   │    pide el CSV por detrás
          ▼                                    ▼    (timeout de 2.5 s)
   menu-data.json  ──►  La carta (estática)  ──► Si llega, actualiza
   (en el repo)         carga al instante        precios y agotados en vivo
                                                 Si no llega, usa lo horneado
```

Por qué así:

1. **La carta nunca depende de Google para dibujarse.** Los datos vienen
   horneados en el sitio: carga instantánea, funciona aunque Google se caiga o
   el cliente tenga una señal pésima. Esto respeta la regla de `CLAUDE.md`.
2. **Pero si hay red, se actualiza al instante.** Cuando el dueño marca un
   agotado, el siguiente cliente que abra la carta ya lo ve, sin esperar los
   10 minutos del build.
3. **Cuesta $0.** GitHub Actions es ilimitado en repos públicos, y el CSV
   publicado no tiene cuota.

### Sobre marcar "agotado"

Vale la pena pensarlo aparte, porque **es lo que más van a usar**: varias veces
al día, con las manos ocupadas, probablemente con harina encima.

- **Fase 2 (fácil):** una columna `Estado` en el Sheet. Escriben `agotado` y
  listo. Funciona desde la app de Sheets en el celular.
- **Fase 3 (mucho mejor):** una página `/panel` con la lista de productos y un
  botón grande por cada uno: **DISPONIBLE / AGOTADO**. Un toque. Escribe al
  Sheet por detrás con Google Apps Script, que también es gratis.

La fase 3 es la que de verdad les cambia el día. Pero primero hay que tener la
fase 2 andando.

---

## 3. Animaciones: qué hay gratis en 2026

### GSAP — ahora 100% gratis

Esta es la mejor noticia del año para este proyecto. En abril de 2025 Webflow
**liberó GSAP completo**, incluidos los plugins que antes costaban membresía:
`SplitText`, `MorphSVG`, `ScrollTrigger`, `Flip`, `DrawSVG`. Es gratis incluso
para uso comercial.

- Peso: ~23 KB gzip el core.
- Es el estándar de la industria para animación web seria.
- ⚠️ Única letra chica: la licencia restringe usarlo para construir
  *herramientas que compitan con el editor visual de Webflow*. No es nuestro
  caso ni de lejos.

### View Transitions API — 0 KB, nativo del navegador

Transiciones entre páginas hechas por el navegador, sin librerías.

| Navegador | Mismo documento | Entre documentos |
|---|---|---|
| Chrome / Edge | 111+ | 126+ |
| Safari | 18+ | 18.2+ |
| Firefox | 144+ | Parcial |

Se usa con detección de características: el navegador que no lo soporta
simplemente cambia de página sin animación. No rompe nada.

### Las demás piezas

| Librería | Peso | Para qué |
|---|---|---|
| **Motion** (motion.dev) | ~2.5 KB | Animaciones sobre la API nativa del navegador. Súper liviano. |
| **Lenis** | ~3 KB | Scroll suave, de esos que se sienten caros. |
| **ogl** | ~20 KB | WebGL mínimo. Suficiente para el *page curl*. |
| **three.js** | ~150 KB | WebGL completo. Potente pero pesado para esto. |

### El efecto estrella: *page curl* con WebGL

El `rotateY` actual es una hoja rígida girando. Un **page curl** de verdad
curva el papel, proyecta sombra sobre la página de abajo y deja ver la
transparencia del papel al trasluz. Es lo que hace que una revista digital se
vea cara.

Se hace con un *shader*: se renderiza la página a una textura y se deforma con
una curva cilíndrica siguiendo el dedo.

**Cómo meterlo sin romper la regla de la mala señal** (mejora progresiva):

1. Por defecto, el `rotateY` con CSS que ya funciona: 0 KB extra.
2. Si el dispositivo tiene WebGL y suficiente memoria, se carga el shader
   **después** de que la carta ya se ve, sin bloquear nada.
3. Si el celular es viejo o el usuario pidió `prefers-reduced-motion`, nunca
   se carga.

Así el cliente con un Android de hace ocho años ve la carta igual de rápido, y
el que tiene un celular bueno ve el efecto completo.

---

## 4. Hosting

| | GitHub Pages | Cloudflare Pages |
|---|---|---|
| Costo | $0 | $0 |
| Repos privados | ❌ Solo públicos en cuenta gratis | ✅ Sí |
| Ancho de banda | 100 GB/mes (límite blando) | Ilimitado para archivos estáticos |
| Tamaño del sitio | 1 GB | 25 MiB por archivo, 20.000 archivos |
| Builds | 10/hora (no aplica con Actions) | 500 deploys/mes, 1 build a la vez |
| Funciones serverless | ❌ No | ✅ 100.000 peticiones/día |
| Red | Fastly | Red propia, 330+ ciudades |

**Recomendación:** quedarse en **GitHub Pages** por ahora — ya está montado y
basta para una carta. Pasar a **Cloudflare Pages** si llega a hacer falta
alguna de estas tres cosas:

- el repo tiene que ser privado,
- se necesita una función en el servidor (por ejemplo para el panel del dueño),
- las fotos hacen crecer mucho el tráfico.

Sobre la latencia en Colombia: no encontré ninguna medición independiente que
aísle Latinoamérica, así que **no te puedo asegurar** que Cloudflare sea más
rápido acá. Si importa, se mide desde Bogotá con WebPageTest y se decide con
el dato, no con la suposición.

⚠️ Nota menor: los términos de GitHub Pages dicen que no es para sitios cuyo
propósito principal sea comercio. Una carta informativa sin carrito ni pagos
no es eso, pero si algún día se agregan pedidos en línea, toca mudarse.

---

## 5. Presupuesto de rendimiento

"Espectacular" y "que cargue rápido con mala señal" tiran para lados opuestos.
La forma de tener los dos es poner un número y no pasarse:

| Métrica | Meta |
|---|---|
| Primera carga (HTML + CSS + JS) | **< 150 KB** |
| LCP en 3G lenta | **< 2,5 s** |
| Peso por foto | **< 80 KB** (AVIF con respaldo WebP) |
| JS que bloquea el render | **0 KB** |

Reglas para cumplirlo: todo lo pesado (GSAP, WebGL) se carga **después** de
que la carta ya se ve; las fotos van en AVIF/WebP, con tamaños según pantalla
y `loading="lazy"`; y las fuentes con `font-display: swap` y respaldo del
sistema, como ya están.

---

## 6. Resumen

| Tema | Recomendación |
|---|---|
| **Bloqueante** | Hacer el repo público y activar Pages |
| **Stack** | Astro (no React) |
| **Datos editables** | Google Sheets publicado como CSV, esquema híbrido |
| **Animación** | GSAP + View Transitions, page curl WebGL como mejora progresiva |
| **Hosting** | GitHub Pages ahora; Cloudflare si crece |
| **Lo que más impacta** | Fotos buenas. Más que cualquier framework. |

---

## Fuentes

- [Webflow hace GSAP 100% gratis](https://webflow.com/updates/gsap-becomes-free)
- [GSAP 3.13 — notas de la versión](https://gsap.com/blog/3-13/)
- [Google Sheets API — límites de uso](https://developers.google.com/workspace/sheets/api/limits)
- [Publicar un CSV desde Google Sheets](https://afosto.com/docs/tutorial-publish-csv-online-from-google-sheets/)
- [Límites de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- [Límites de Cloudflare Pages](https://developers.cloudflare.com/pages/platform/limits/index.md)
- [Novedades de View Transitions (2025)](https://developer.chrome.com/blog/view-transitions-in-2025)
- [Guía completa de CSS View Transitions 2026](https://devtoolbox.dedyn.io/blog/css-view-transitions-complete-guide)
