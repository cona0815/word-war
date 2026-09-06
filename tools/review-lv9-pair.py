"""Compare accepted frame pixels at identical render scale, without changing art."""
from pathlib import Path
import sys
from PIL import Image, ImageDraw

root=Path(__file__).resolve().parents[1]
folders=['hero-male-shadow-cast-lv9-v5-body-v2','hero-female-shadow-cast-lv9-v1-body-v2']
level=9
if len(sys.argv)>1:
    if len(sys.argv)!=4 or any(Path(p).name!=p for p in sys.argv[2:]):
        raise ValueError('Expected level and two asset folder names')
    level=int(sys.argv[1])
    folders=sys.argv[2:]
review=Image.new('RGBA',(1152,708),'#344347')
draw=ImageDraw.Draw(review)
for col,folder in enumerate(folders):
    strip=Image.open(root/'assets/generated'/folder/'cast-strip.png').convert('RGBA')
    for row,index in enumerate([0,5]):
        frame=strip.crop((index*1152,0,(index+1)*1152,648)).resize((576,324),Image.Resampling.LANCZOS)
        review.alpha_composite(frame,(col*576,row*354+24))
        draw.text((col*576+12,row*354+8),f'{"Male" if col==0 else "Female"} Lv{level} | frame {index+1}',fill='white')
        draw.line((col*576,row*354+329,(col+1)*576,row*354+329),fill='#83bfb1',width=1)
out=root/f'docs/qa-cast-review/lv{level}-pair.png'
out.parent.mkdir(parents=True,exist_ok=True)
review.convert('RGB').save(out)
print(out)
