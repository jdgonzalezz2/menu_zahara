"""
Deja una foto lista para la carta: la recorta, la redimensiona y la guarda
en WebP liviano dentro de public/assets/.

Requisito (una sola vez):
    pip install pillow

Uso:
    python scripts/preparar-foto.py  C:/ruta/a/la/foto.jpg  combo-1
    python scripts/preparar-foto.py  foto.jpg  combo-1  --cuadrada

El segundo argumento es el nombre que va a quedar (sin extensión) y es el
mismo que se escribe en la columna "Foto" del Google Sheet.

Qué hace:
  - Recorta al centro en proporción 3:2 (la que usa la carta).
  - Redimensiona a 900x600, que se ve nítido hasta en pantallas retina.
  - Guarda en WebP buscando la calidad más alta que quepa en 80 KB.
  - Quita los metadatos EXIF (ubicación GPS, modelo del celular, etc.),
    que no tienen por qué acabar publicados.
"""

import sys
from pathlib import Path
from PIL import Image, ImageOps

RAIZ = Path(__file__).resolve().parent.parent
DESTINO = RAIZ / "public" / "assets"

ANCHO, ALTO = 900, 600          # 3:2, el aspect-ratio que usa .item-photo
PESO_MAXIMO = 80 * 1024         # 80 KB: el presupuesto por foto
CALIDADES = [82, 76, 70, 64, 58, 52, 45]


def recortar_centrado(img: Image.Image, proporcion: float) -> Image.Image:
    """Recorta al centro para que quede en la proporción pedida."""
    ancho, alto = img.size
    actual = ancho / alto

    if actual > proporcion:          # sobra a los lados
        nuevo_ancho = round(alto * proporcion)
        x = (ancho - nuevo_ancho) // 2
        return img.crop((x, 0, x + nuevo_ancho, alto))

    if actual < proporcion:          # sobra arriba y abajo
        nuevo_alto = round(ancho / proporcion)
        y = (alto - nuevo_alto) // 2
        return img.crop((0, y, ancho, y + nuevo_alto))

    return img


def preparar(origen: Path, nombre: str, cuadrada: bool = False) -> Path:
    if not origen.exists():
        raise SystemExit(f"No encuentro el archivo: {origen}")

    ancho, alto = (700, 700) if cuadrada else (ANCHO, ALTO)

    img = Image.open(origen)

    # Respeta la orientación con que se tomó la foto y, de paso, bota el EXIF
    img = ImageOps.exif_transpose(img)
    img = img.convert("RGB")

    img = recortar_centrado(img, ancho / alto)
    img = img.resize((ancho, alto), Image.LANCZOS)

    DESTINO.mkdir(parents=True, exist_ok=True)
    salida = DESTINO / f"{nombre}.webp"

    # Baja la calidad por pasos hasta que entre en el presupuesto
    for calidad in CALIDADES:
        img.save(salida, format="WEBP", quality=calidad, method=6)
        peso = salida.stat().st_size
        if peso <= PESO_MAXIMO:
            break

    peso_kb = salida.stat().st_size / 1024
    aviso = "" if peso_kb * 1024 <= PESO_MAXIMO else "  ⚠️ no bajó de 80 KB"

    print(f"Listo: {salida.relative_to(RAIZ)}")
    print(f"  {ancho}x{alto} px · {peso_kb:.0f} KB · calidad {calidad}{aviso}")
    print(f'  Ahora escribe "{nombre}.webp" en la columna Foto del Sheet.')
    return salida


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    cuadrada = "--cuadrada" in sys.argv

    if len(args) < 2:
        raise SystemExit(
            "Uso: python scripts/preparar-foto.py <foto> <nombre> [--cuadrada]\n"
            "Ej:  python scripts/preparar-foto.py fotos/combo1.jpg combo-1"
        )

    preparar(Path(args[0]), args[1], cuadrada)
