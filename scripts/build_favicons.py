from pathlib import Path

from colorsys import rgb_to_hsv

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "client/public"
SOURCE = PUBLIC / "icons/favicon-source.png"
MASTER = PUBLIC / "icons/favicon-master.png"


def resized(source, size):
    return source.resize((size, size), Image.Resampling.LANCZOS)


def remove_exterior_background(source):
    """Make only the area outside the irregular red seal transparent."""
    source = source.convert("RGBA")
    width, height = source.size
    pixels = source.load()
    mask = Image.new("L", source.size, 0)
    mask_pixels = mask.load()

    for y in range(height):
        red_positions = []
        for x in range(width):
            red, green, blue, _ = pixels[x, y]
            hue, saturation, value = rgb_to_hsv(red / 255, green / 255, blue / 255)
            is_red_ink = (hue <= 0.08 or hue >= 0.96) and saturation >= 0.32 and value >= 0.25
            if is_red_ink:
                red_positions.append(x)

        if red_positions:
            left, right = min(red_positions), max(red_positions)
            for x in range(left, right + 1):
                mask_pixels[x, y] = 255

    mask = mask.filter(ImageFilter.GaussianBlur(0.45))
    source.putalpha(mask)
    return source


def main():
    source = remove_exterior_background(Image.open(SOURCE))
    source.save(MASTER, optimize=True)

    outputs = {
        PUBLIC / "icons/favicon-16x16.png": 16,
        PUBLIC / "icons/favicon-32x32.png": 32,
        PUBLIC / "icons/favicon-48x48.png": 48,
        PUBLIC / "apple-touch-icon.png": 180,
        PUBLIC / "logo192.png": 192,
        PUBLIC / "logo512.png": 512,
    }

    for path, size in outputs.items():
        resized(source, size).save(path, optimize=True)

    source.save(
        PUBLIC / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
    )


if __name__ == "__main__":
    main()
