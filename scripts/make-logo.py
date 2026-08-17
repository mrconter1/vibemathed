"""Export the site's favicon as PNG assets (Discord icon, avatars, banners).

The source of truth is src/app/icon.svg - the blue rounded square with the
cream wave that the site actually serves as its icon:

    <rect width="32" height="32" rx="7" fill="#2a78d6"/>
    <path d="M4 16 C 7 9, 11 9, 16 16 C 21 23, 25 23, 28 16"
          fill="none" stroke="#f3efe3" stroke-width="3.4"
          stroke-linecap="round" stroke-linejoin="round"/>

It is redrawn here rather than rasterised through a converter: the shape is
two primitives, cairosvg needs a system cairo that is not installed here, and
svglib misreads the viewBox as 24x24 (it honours width/height attributes that
this file does not set). Drawing it directly also means the wave can be
supersampled, which matters - a 3.4/32 stroke scaled to 1024px is 109px wide,
and a naive polyline shows its segment joints at that size.

Geometry is taken verbatim from the SVG and scaled, so the output is the
favicon at any size rather than something that resembles it.

Outputs to ~/Downloads:

    vibemathed-icon-512.png       Discord's recommended server-icon size
    vibemathed-icon-1024.png      2x, for banners and upscaling
    vibemathed-icon-256.png       small avatars
    vibemathed-icon-round-512.png circular crop, for platforms that mask
    vibemathed-icon-square-512.png hard corners, for tiles that round it
                                   themselves
"""
import os

from PIL import Image, ImageDraw

# Verbatim from icon.svg.
VIEWBOX = 32.0
BLUE = (42, 120, 214, 255)  # #2a78d6
CREAM = (243, 239, 227, 255)  # #f3efe3
RADIUS = 7.0
STROKE = 3.4
CURVE = [
    # (start, c1, c2, end) in viewBox units - the two cubics of the path.
    ((4, 16), (7, 9), (11, 9), (16, 16)),
    ((16, 16), (21, 23), (25, 23), (28, 16)),
]

SS = 4  # supersampling factor
OUT = os.path.join(os.environ["USERPROFILE"], "Downloads")


def bezier(p0, p1, p2, p3, steps):
    """Points along one cubic Bezier."""
    pts = []
    for i in range(steps + 1):
        t = i / steps
        u = 1 - t
        x = u**3 * p0[0] + 3 * u**2 * t * p1[0] + 3 * u * t**2 * p2[0] + t**3 * p3[0]
        y = u**3 * p0[1] + 3 * u**2 * t * p1[1] + 3 * u * t**2 * p2[1] + t**3 * p3[1]
        pts.append((x, y))
    return pts


def render(size, corners="rounded"):
    """The favicon at `size` px. corners: rounded | square | circle."""
    s = size * SS
    scale = s / VIEWBOX
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    if corners == "square":
        d.rectangle([0, 0, s - 1, s - 1], fill=BLUE)
    elif corners == "circle":
        d.ellipse([0, 0, s - 1, s - 1], fill=BLUE)
    else:
        d.rounded_rectangle([0, 0, s - 1, s - 1], radius=RADIUS * scale, fill=BLUE)

    # The wave, as one point list through both cubics so the join at (16,16)
    # is continuous rather than two strokes meeting.
    pts = []
    for seg in CURVE:
        part = bezier(*seg, steps=600)
        pts.extend(part if not pts else part[1:])
    pts = [(x * scale, y * scale) for x, y in pts]

    # Stamp a disc at every sample rather than calling d.line with a width.
    # A round-capped, round-joined stroke IS the union of discs along the
    # path, and PIL's thick polyline is not: it draws each segment as its
    # own quad, so at this width (109px at 1024) the seams between segments
    # show as hairlines across the wave.
    r = STROKE * scale / 2
    for x, y in pts:
        d.ellipse([x - r, y - r, x + r, y + r], fill=CREAM)

    return img.resize((size, size), Image.LANCZOS)


def main():
    jobs = [
        ("vibemathed-icon-512.png", render(512)),
        ("vibemathed-icon-1024.png", render(1024)),
        ("vibemathed-icon-256.png", render(256)),
        ("vibemathed-icon-round-512.png", render(512, corners="circle")),
        ("vibemathed-icon-square-512.png", render(512, corners="square")),
    ]
    for name, img in jobs:
        path = os.path.join(OUT, name)
        img.save(path, "PNG")
        print(f"  {name}  {img.size[0]}x{img.size[1]}  {os.path.getsize(path) / 1024:.0f} KB")
    print(f"\nwritten to {OUT}")


if __name__ == "__main__":
    main()
