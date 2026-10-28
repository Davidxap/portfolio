"""Writes the personal favicon set: the coffee mug on a 16x16 pixel grid.

Run from the repo root:  python3.14 -I scripts/art/favicon.py
Needs Python 3 + Pillow. Outputs public/favicon.svg and the PNG sizes.
Palette: . transparent, k tile, a mug body, d body shade, c rim/steam, t saucer.
"""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PUB = os.path.join(ROOT, "public")

GRID = [
    "..kkkkkkkkkkkk..",
    ".kkkkkkkkkkkkkk.",
    "kkkkkkckkkckkkkk",
    "kkkkkckkkckkkkkk",
    "kkkkkkckkkckkkkk",
    "kkkkkkkkkkkkkkkk",
    "kkkcccccccccckkk",
    "kkkacaaaaaaddaak",
    "kkkacaaaaaaddkak",
    "kkkaaaaaaaaddkak",
    "kkkaaaaaaaaddaak",
    "kkkaaaaaaaaddkkk",
    "kkkkaaaaaaaddkkk",
    "kktttttttttttkkk",
    ".kkkkkkkkkkkkkk.",
    "..kkkkkkkkkkkk..",
]
COLORS = {"k": "#16120f", "a": "#e9a55c", "d": "#b8743a", "c": "#f4e9d8", "t": "#6fcfc2"}
TILE = (0x16, 0x12, 0x0F, 255)

for i, row in enumerate(GRID):
    assert len(row) == 16, f"row {i} has {len(row)} chars"
assert len(GRID) == 16


def hex_rgba(h):
    return (int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16), 255)


def grid_image():
    img = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    for y, row in enumerate(GRID):
        for x, ch in enumerate(row):
            if ch != ".":
                img.putpixel((x, y), hex_rgba(COLORS[ch]))
    return img


def svg():
    rects = []
    for y, row in enumerate(GRID):
        x = 0
        while x < 16:
            ch = row[x]
            n = 1
            while x + n < 16 and row[x + n] == ch:
                n += 1
            if ch != ".":
                rects.append(f'<rect x="{x}" y="{y}" width="{n}" height="1" fill="{COLORS[ch]}"/>')
            x += n
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">' + "".join(rects) + "</svg>\n"


def centred(scale, size):
    """The grid at an integer scale, centred on a full-bleed tile square."""
    base = Image.new("RGBA", (size, size), TILE)
    g = grid_image().resize((16 * scale, 16 * scale), Image.NEAREST)
    # full-bleed: corners of the grid art are transparent, so paste with its own mask over the tile
    off = (size - 16 * scale) // 2
    base.paste(g, (off, off), g)
    return base


def main():
    with open(os.path.join(PUB, "favicon.svg"), "w") as f:
        f.write(svg())
    g = grid_image()
    g.save(os.path.join(PUB, "favicon-16.png"))
    g.resize((32, 32), Image.NEAREST).save(os.path.join(PUB, "favicon-32.png"))
    # favicon.ico: 16/32/48 px, nearest-neighbour from the mug grid (browsers request /favicon.ico by default)
    ico = [g.resize((n, n), Image.NEAREST) for n in (16, 32, 48)]
    ico[2].save(os.path.join(PUB, "favicon.ico"), format="ICO", sizes=[(16, 16), (32, 32), (48, 48)], append_images=ico[:2])
    centred(11, 180).save(os.path.join(PUB, "apple-touch-icon.png"))
    centred(12, 192).save(os.path.join(PUB, "icon-192.png"))
    centred(32, 512).save(os.path.join(PUB, "icon-512.png"))
    centred(24, 512).save(os.path.join(PUB, "icon-512-maskable.png"))
    print("favicon set written to", PUB)


if __name__ == "__main__":
    main()
