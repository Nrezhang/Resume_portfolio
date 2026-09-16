from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "client/public"
SOURCE = PUBLIC / "icons/favicon-master.png"


def resized(source, size):
    return source.resize((size, size), Image.Resampling.LANCZOS)


def main():
    source = Image.open(SOURCE).convert("RGBA")

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
