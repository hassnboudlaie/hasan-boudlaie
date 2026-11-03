"""Produce approved TRM lettermark icons without touching other apps or candidate data."""
from pathlib import Path
import cairosvg
root=Path(__file__).resolve().parent
source=root/"icon.svg"
android=root.parent/"trm-android"/"app"/"src"/"main"/"res"/"drawable-nodpi"/"trm_brand.png"
android.parent.mkdir(parents=True,exist_ok=True)
for size in (192,512):
    cairosvg.svg2png(url=str(source),write_to=str(root/f"icon-{size}.png"),output_width=size,output_height=size)
cairosvg.svg2png(url=str(source),write_to=str(android),output_width=512,output_height=512)
print("TRM web and native Android icons generated")
