"""Composite existing transparent frames over a neutral matte for visual QA."""
from pathlib import Path
import sys
from PIL import Image

root=Path(__file__).resolve().parents[1]
folder=sys.argv[1]
if Path(folder).name!=folder:
    raise ValueError('Expected one asset folder name')
source=Image.open(root/'assets/generated'/folder/'cast-strip.png').convert('RGBA')
width=source.width//6
review=Image.new('RGBA',(1440,540),'#364447')
for i in range(6):
    frame=source.crop((i*width,0,(i+1)*width,source.height))
    frame.thumbnail((480,270),Image.Resampling.LANCZOS)
    review.alpha_composite(frame,((i%3)*480,(i//3)*270))
out=root/'docs/qa-cast-review'
out.mkdir(parents=True,exist_ok=True)
review.convert('RGB').save(out/(folder+'.png'))
print(out/(folder+'.png'))
