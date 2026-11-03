"""Generate trademark-independent PNG PWA icons at build time."""
from pathlib import Path
from PIL import Image, ImageDraw
root=Path(__file__).parent / 'static'
root.mkdir(parents=True, exist_ok=True)
for size in (192,512):
    im=Image.new('RGBA',(size,size),'#115C61')
    d=ImageDraw.Draw(im)
    u=lambda x:int(x*size/512)
    d.ellipse((u(196),u(85),u(322),u(211)),fill='#E7BD81')
    d.ellipse((u(76),u(278),u(158),u(360)),fill='#C9EDE1')
    d.ellipse((u(355),u(279),u(437),u(361)),fill='#C9EDE1')
    d.line([(u(260),u(215)),(u(260),u(281))], fill='#F6F0DC',width=max(2,u(20)))
    d.line([(u(220),u(285)),(u(142),u(314))], fill='#F6F0DC',width=max(2,u(19)))
    d.line([(u(298),u(285)),(u(374),u(314))], fill='#F6F0DC',width=max(2,u(19)))
    d.rounded_rectangle((u(177),u(319),u(340),u(407)),radius=u(44),fill='#E7BD81')
    d.ellipse((u(237),u(248),u(283),u(294)),fill='#F6F0DC')
    im.save(root/f'icon-{size}.png')