"""Regenerate independent HB Hub PWA icon assets; no other app is touched."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
root=Path(__file__).resolve().parent
for size in (192,512):
 image=Image.new('RGB',(size,size),'#f7f3e9')
 draw=ImageDraw.Draw(image)
 pad=int(size*.05)
 draw.rounded_rectangle((pad,pad,size-pad,size-pad),radius=int(size*.19),fill='#183f36')
 try: font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',int(size*.32))
 except OSError: font=ImageFont.load_default()
 draw.text((size//2,size//2),'HB',font=font,fill='#fff8e7',anchor='mm')
 draw.line([(int(size*.29),int(size*.74)),(int(size*.71),int(size*.74))],fill='#d8aa79',width=max(2,int(size*.018)))
 image.save(root/f'icon-{size}.png',optimize=True)