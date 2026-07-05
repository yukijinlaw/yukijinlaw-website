#!/usr/bin/env python3
"""
resize-images.py
Generate optimized responsive headshot images with center-crop to a portrait ratio.

Usage:
  python scripts/resize-images.py images/p2.jpg

Produces: images/p2-480.jpg, images/p2-768.jpg, images/p2-1200.jpg

Requires: Pillow (see requirements.txt)
"""
import sys
from pathlib import Path
from PIL import Image

TARGETS = [480, 768, 1200]
ASPECT_W = 4
ASPECT_H = 5


def center_crop_to_aspect(img: Image.Image, aspect_w: int, aspect_h: int) -> Image.Image:
    w, h = img.size
    target_ratio = aspect_w / aspect_h
    current_ratio = w / h
    if current_ratio > target_ratio:
        # image is too wide -> crop width
        new_w = int(h * target_ratio)
        offset = (w - new_w) // 2
        box = (offset, 0, offset + new_w, h)
    else:
        # image is too tall -> crop height
        new_h = int(w / target_ratio)
        offset = (h - new_h) // 2
        box = (0, offset, w, offset + new_h)
    return img.crop(box)


def make_variants(input_path: Path):
    img = Image.open(input_path).convert("RGB")
    img = center_crop_to_aspect(img, ASPECT_W, ASPECT_H)
    out_files = []
    for w in TARGETS:
        h = int(w * ASPECT_H / ASPECT_W)
        out = img.resize((w, h), Image.LANCZOS)
        out_path = input_path.parent / f"{input_path.stem}-{w}.jpg"
        out.save(out_path, format="JPEG", quality=85, optimize=True)
        out_files.append(out_path)
        print(f"Created {out_path}")
    return out_files


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/resize-images.py path/to/image.jpg")
        sys.exit(2)
    input_path = Path(sys.argv[1])
    if not input_path.exists():
        print(f"Input file not found: {input_path}")
        sys.exit(1)
    make_variants(input_path)


if __name__ == '__main__':
    main()
