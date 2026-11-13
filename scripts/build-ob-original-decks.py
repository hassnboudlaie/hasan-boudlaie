#!/usr/bin/env python3
"""Render verified original 2000-edition Robbins PPTs without rewriting slide content.
Running locally or in GitHub Actions requires LibreOffice, poppler and Pillow.
Original PPT is retained; derived PDFs and webp slides are published as visual
presentation assets. Never derive original content from local English paraphrases.
"""
from pathlib import Path
import subprocess, tempfile, json, sys, shutil
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "ob-mba-classroom" / "materials" / "original"
MANIFEST = {"version":1,"source":"Uploaded original PowerPoint decks (publisher slides, 2000)","sessions":{}}
for session,expected in [(1,16),(2,14)]:
    stem=f"session-{session:02d}"
    ppt=SOURCE/(stem+"-robbins.ppt")
    if not ppt.exists(): raise RuntimeError(f"Missing original PPT {ppt}")
    with tempfile.TemporaryDirectory(prefix=f"ob-render-{session}-") as tmp:
        t=Path(tmp)
        profile=(t/"lo-profile").as_uri()
        cmd=["soffice",f"-env:UserInstallation={profile}","--headless","--convert-to","pdf","--outdir",str(t),str(ppt)]
        subprocess.run(cmd,check=True,timeout=180,capture_output=True,text=True)
        converted=t/(stem+"-robbins.pdf")
        if not converted.exists(): raise RuntimeError("Original PPT could not be converted")
        pdf=SOURCE/(stem+".pdf")
        shutil.copy2(converted,pdf)
        info=subprocess.run(["pdfinfo",str(pdf)],check=True,capture_output=True,text=True).stdout
        import re
        m=re.search(r"^Pages:\s*(\d+)",info,re.MULTILINE)
        count=int(m.group(1)) if m else 0
        if count!=expected: raise RuntimeError(f"Original session {session} expected {expected} pages, got {count}")
        render_prefix=t/"page"
        subprocess.run(["pdftoppm","-jpeg","-r","115","-jpegopt","quality=87,optimize=y",str(pdf),str(render_prefix)],check=True,timeout=180,capture_output=True)
        output_dir=SOURCE/stem
        output_dir.mkdir(parents=True,exist_ok=True)
        images=sorted(t.glob("page-*.jpg"))
        if len(images)!=expected: raise RuntimeError(f"Bad slide rendering: {len(images)}")
        for idx,path in enumerate(images,1):
            with Image.open(path) as im:
                if im.mode!="RGB": im=im.convert("RGB")
                # Publisher's original 4:3 slide composition is preserved.
                final=output_dir/f"slide-{idx:02d}.webp"
                im.save(final,format="WEBP",quality=85,method=5)
        MANIFEST["sessions"][str(session)]={"slides":count,"format":"webp","aspect":"4:3",
            "pagePattern":f"materials/original/{stem}/slide-%02d.webp",
            "pdf":f"materials/original/{stem}.pdf",
            "powerpoint":f"materials/original/{stem}-robbins.ppt"}
        print(f"Original {stem}: {count} pages; size "+str(sum(x.stat().st_size for x in output_dir.glob("*.webp")))+" bytes")
(SOURCE/"manifest.json").write_text(json.dumps(MANIFEST,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("Original source fidelity manifest generated")
