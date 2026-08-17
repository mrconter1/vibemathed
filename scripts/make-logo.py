"""VibeMathed logo files for the Discord community.

Built from the site's own brand rather than invented: the wordmark is
"Vibe" in ink with "Mathed" in accent blue, set in a serif, on the cream
paper ground - the same split the header renders. Colours are lifted from
globals.css:

    --paper       #f3efe3
    --ink         #201d17
    --accent-blue #2a78d6
    dark --paper  #17150f   (used for the dark variant)

Outputs (Discord wants square PNGs; 512 is its recommended server icon):

    vibemathed-icon-512.png      square "VM" mark, cream ground
    vibemathed-icon-512-dark.png same on the dark ground
    vibemathed-icon-1024.png     same mark at 2x for banners/upscaling
    vibemathed-wordmark-1024.png full "VibeMathed" wordmark, transparent
    vibemathed-icon-round-512.png circular crop, for platforms that mask
"""
import os

from PIL import Image, ImageDraw, ImageFont

PAPER = (243, 239, 227, 255)
PAPER_DARK = (23, 21, 15, 255)
INK = (32, 29, 23, 255)
INK_DARK = (240, 235, 221, 255)
BLUE = (42, 120, 214, 255)
BLUE_DARK = (106, 165, 232, 255)

OUT = os.path.join(os.environ["USERPROFILE"], "Downloads")
SERIF = "C:/Windows/Fonts/cambria.ttc"
SERIF_BOLD = "C:/Windows/Fonts/cambriab.ttf"


def font(path, size):
    return ImageFont.truetype(path, size)


def draw_centered(d, xy, text, f, fill, anchor="mm"):
    d.text(xy, text, font=f, fill=fill, anchor=anchor)


def icon(size, ground, ink, blue, round_mask=False):
    """The square mark: 'V' in ink, 'M' in accent blue, sharing a baseline."""
    img = Image.new("RGBA", (size, size), ground)
    d = ImageDraw.Draw(img)

    f = font(SERIF_BOLD, int(size * 0.44))
    wv = d.textlength("V", font=f)
    wm = d.textlength("M", font=f)
    total = wv + wm
    x = (size - total) / 2

    # Centre the LOCKUP (letters plus the rule beneath), not the glyphs
    # alone - centring the glyphs leaves the rule hanging and the mark reads
    # top-heavy at icon sizes. Positions come from the drawn bounding box,
    # not font metrics: the metrics include ascender and descender space
    # these two capitals do not occupy, which is what threw the first cut.
    box = d.textbbox((x, 0), "VM", font=f, anchor="la")
    cap_h = box[3] - box[1]
    gap = size * 0.085
    rule_w = max(2, int(size * 0.016))
    lockup_h = cap_h + gap + rule_w
    top = (size - lockup_h) / 2
    # Drawing at anchor "la" puts the glyph TOP at y + box[1], so shift by
    # that offset to land the caps exactly on `top`.
    y = top - box[1]

    d.text((x, y), "V", font=f, fill=ink, anchor="la")
    d.text((x + wv, y), "M", font=f, fill=blue, anchor="la")

    # A rule under the mark, echoing the site's hairline borders and giving
    # the icon a horizon so it does not float at small sizes. Matched to the
    # glyph width, so it underlines the letters rather than reading as a
    # separate element.
    rule_y = int(top + cap_h + gap)
    d.line([(x, rule_y), (x + total, rule_y)], fill=blue, width=rule_w)

    if round_mask:
        mask = Image.new("L", (size, size), 0)
        ImageDraw.Draw(mask).ellipse([0, 0, size - 1, size - 1], fill=255)
        out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        out.paste(img, (0, 0), mask)
        return out
    return img


def wordmark(width=1024):
    """Full 'VibeMathed' on transparent, for headers and Discord banners."""
    height = int(width * 0.30)
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    f = font(SERIF_BOLD, int(height * 0.52))
    w1 = d.textlength("Vibe", font=f)
    w2 = d.textlength("Mathed", font=f)
    x = (width - (w1 + w2)) / 2
    y = height * 0.44
    d.text((x, y), "Vibe", font=f, fill=INK, anchor="lm")
    d.text((x + w1, y), "Mathed", font=f, fill=BLUE, anchor="lm")

    fs = font(SERIF, int(height * 0.135))
    d.text(
        (width / 2, height * 0.78),
        "Math problems solved with AI",
        font=fs,
        fill=(90, 84, 72, 255),
        anchor="mm",
    )
    return img


def main():
    jobs = [
        ("vibemathed-icon-512.png", icon(512, PAPER, INK, BLUE)),
        ("vibemathed-icon-512-dark.png", icon(512, PAPER_DARK, INK_DARK, BLUE_DARK)),
        ("vibemathed-icon-1024.png", icon(1024, PAPER, INK, BLUE)),
        ("vibemathed-icon-round-512.png", icon(512, PAPER, INK, BLUE, round_mask=True)),
        ("vibemathed-wordmark-1024.png", wordmark(1024)),
    ]
    for name, img in jobs:
        path = os.path.join(OUT, name)
        img.save(path, "PNG")
        print(f"  {name}  {img.size[0]}x{img.size[1]}  {os.path.getsize(path)/1024:.0f} KB")
    print(f"\nwritten to {OUT}")


if __name__ == "__main__":
    main()
