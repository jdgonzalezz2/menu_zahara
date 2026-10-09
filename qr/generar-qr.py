"""
Genera el código QR estático del menú — 100% offline, sin servicios web.

Requisito (una sola vez):
    pip install "qrcode[pil]"

Uso:
    python qr/generar-qr.py
    python qr/generar-qr.py https://otra-url.com/  qr/menu-qr.png

El QR sale en 1000x1000 px, listo para imprimir.
"""

import sys
import qrcode
from PIL import Image

# URL por defecto: la de GitHub Pages de este repo.
URL_POR_DEFECTO = "https://jdgonzalezz2.github.io/menu_zahara/"
SALIDA_POR_DEFECTO = "qr/menu-qr.png"
TAMANO = 1000  # px del lado, bueno para imprimir


def generar(url: str, salida: str) -> None:
    qr = qrcode.QRCode(
        version=None,                                       # versión mínima que quepa
        error_correction=qrcode.constants.ERROR_CORRECT_M,  # ~15% de recuperación
        box_size=28,
        border=4,                                           # quiet zone (margen) mínimo
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white").convert("RGB")
    # NEAREST mantiene los bordes duros; nada de bordes borrosos al escalar.
    img = img.resize((TAMANO, TAMANO), Image.NEAREST)
    img.save(salida, format="PNG", optimize=True)

    print(f"Listo: {salida}  ({TAMANO}x{TAMANO} px)")
    print(f"Apunta a: {url}")
    print("Recuerda probarlo con varios celulares antes de mandar a imprimir.")


if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else URL_POR_DEFECTO
    salida = sys.argv[2] if len(sys.argv) > 2 else SALIDA_POR_DEFECTO
    generar(url, salida)
