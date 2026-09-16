from colorsys import rgb_to_hls, hls_to_rgb
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "client/public/brand-concepts/nre-zhang-purple-seal-concept.png"
OUTPUT = ROOT / "client/public/brand-concepts/seal-colors"

COLORS = {
    "original-purple": "#4F286B",
    "stamp-red": "#C43B2F",
    "navy-blue": "#12355B",
    "cobalt-blue": "#1D4ED8",
    "editorial-blue": "#346C8C",
    "indigo-blue": "#253B80",
}


def hex_rgb(value):
    value = value.lstrip("#")
    return tuple(int(value[index : index + 2], 16) for index in (0, 2, 4))


def recolor(source, target_hex):
    target = tuple(channel / 255 for channel in hex_rgb(target_hex))
    target_hue, target_lightness, target_saturation = rgb_to_hls(*target)
    output = source.copy().convert("RGBA")
    pixels = output.load()

    for y in range(output.height):
        for x in range(output.width):
            red, green, blue, alpha = pixels[x, y]
            hue, lightness, saturation = rgb_to_hls(red / 255, green / 255, blue / 255)

            # Select only the purple ink, including its antialiased and distressed edges.
            is_purple_hue = 0.70 <= hue <= 0.92
            if saturation > 0.08 and is_purple_hue:
                lightness_offset = lightness - 0.29
                new_lightness = max(0, min(1, target_lightness + lightness_offset))
                edge_factor = min(1, saturation / 0.35)
                new_saturation = target_saturation * edge_factor
                new_red, new_green, new_blue = hls_to_rgb(
                    target_hue, new_lightness, new_saturation
                )
                pixels[x, y] = (
                    round(new_red * 255),
                    round(new_green * 255),
                    round(new_blue * 255),
                    alpha,
                )

    return output


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    source = Image.open(SOURCE).convert("RGBA")
    variants = []

    for name, color in COLORS.items():
        image = source.copy() if name == "original-purple" else recolor(source, color)
        path = OUTPUT / f"nre-zhang-seal-{name}.png"
        image.save(path, optimize=True)
        variants.append((name, color, image))

    cell_width, cell_height = 440, 475
    sheet = Image.new("RGB", (cell_width * 3, cell_height * 2), "#F5F0E4")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default(size=18)

    for index, (name, color, image) in enumerate(variants):
        column, row = index % 3, index // 3
        x = column * cell_width + 20
        y = row * cell_height + 10
        sheet.paste(image.convert("RGB"), (x, y))
        label = f"{name.replace('-', ' ').title()}  {color}"
        label_width = draw.textbbox((0, 0), label, font=font)[2]
        draw.text(
            (column * cell_width + (cell_width - label_width) / 2, y + 410),
            label,
            fill="#343434",
            font=font,
        )

    sheet.save(OUTPUT / "nre-zhang-seal-color-comparison.png", optimize=True)


if __name__ == "__main__":
    main()
