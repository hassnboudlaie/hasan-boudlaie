#!/usr/bin/env python3
"""Render faithful slide images from verified Session-03 source PDF exports.
Keeps the uploaded PowerPoint (.ppt/.pptx) and full PDF files unchanged.
Original English: 13 pages; supplied Persian personality deck: 51 pages.
"""
from pathlib import Path
from PIL import Image
import subprocess, tempfile, re, json

ROOT=Path(__file__).resolve().parents[1]
APP=ROOT/"ob-mba-classroom"
SOURCES=[
  {"label":"English Robbins Chapter 3","src":APP/"materials/original/session-03.pdf","out":APP/"materials/original/session-03","expected":13},
  {"label":"Persian personality presentation","src":APP/"materials/readings/personality-session-03.pdf","out":APP/"materials/readings/session-03-fa","expected":51},
]

for deck in SOURCES:
    source=deck["src"]
    if not source.is_file():
        raise FileNotFoundError(f"Original PDF missing: {source}")
    info=subprocess.run(["pdfinfo",str(source)],capture_output=True,text=True,check=True).stdout
    match=re.search(r"^Pages:\s*(\d+)",info,re.M)
    pages=int(match.group(1)) if match else -1
    if pages!=deck["expected"]:
        raise RuntimeError(f"{deck['label']}: expected {deck['expected']} PDF pages, found {pages}")
    out=deck["out"]
    out.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="ob03-render-") as working:
        base=Path(working)/"slide"
        subprocess.run(["pdftoppm","-jpeg","-r","110","-jpegopt","quality=88,optimize=y",str(source),str(base)],check=True,timeout=420)
        images=sorted(Path(working).glob("slide-*.jpg"))
        if len(images)!=pages:
            raise RuntimeError(f"Rendered only {len(images)} of {pages} pages for {deck['label']}")
        for i,slide in enumerate(images,1):
            with Image.open(slide) as image:
                if image.mode!="RGB": image=image.convert("RGB")
                target=out/f"slide-{i:02d}.webp"
                image.save(target,"WEBP",quality=85,method=5)
        verified=list(out.glob("slide-*.webp"))
        if len(verified)!=pages:
            raise RuntimeError(f"Image count mismatch: {deck['label']}")
        print(f"PASS {deck['label']}: {pages} original slides converted without editing, total {sum(p.stat().st_size for p in verified)} bytes")
print("Session 3 source-slide rendering completed.")
