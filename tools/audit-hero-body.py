"""Build a review sheet and measure central body silhouettes without changing art."""
from pathlib import Path
import re
import json
import sys
import numpy as np
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
entries = re.findall(r"\['([^']+)','([^']+)',(\d+),(\d+)\]", (root/'hero-cast-clips.js').read_text())
out = root/'docs/qa-body-scale'
out.mkdir(parents=True, exist_ok=True)
sheet = Image.new('RGB', (280*4, 330*4), '#30464c')
draw = ImageDraw.Draw(sheet)
report = []
for i,(key,folder,width,duration) in enumerate(entries):
    width = int(width)
    strip = Image.open(root/'assets/generated'/folder/'cast-strip.png').convert('RGBA')
    idle = strip.crop((0,0,width,strip.height))
    a = np.asarray(idle)[:,:,3]
    ys,xs = np.where(a>128)
    bottom = int(ys.max())+1
    fy,fx = np.where(a[max(0,bottom-10):bottom]>128)
    footx = float((fx.min()+fx.max())/2)
    lo,hi = round(footx-width*.06),round(footx+width*.06)
    cy,cx = np.where(a[:,max(0,lo):min(width,hi)]>128)
    top = int(cy.min())
    record = dict(key=key,folder=folder,width=width,top=top,bottom=bottom,footx=footx,bodyHeight=bottom-top)
    report.append(record)
    preview = idle.copy()
    d = ImageDraw.Draw(preview)
    d.line((0,top,width,top),fill='#00ff99',width=2)
    d.line((0,bottom,width,bottom),fill='#00ff99',width=2)
    preview.thumbnail((280,290))
    x,y=(i%4)*280,(i//4)*330
    sheet.paste(preview,(x,y+30),preview)
    draw.text((x+5,y+5),f'{key} h={bottom-top}',fill='white')
sheet.save(out/'review.png')
(out/'measurements.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
if '--verify' in sys.argv:
    assert all(abs(r['bodyHeight']-460)<=3 for r in report), 'Body size drift'
    assert all(abs(r['bottom']-610)<=1 for r in report), 'Foot baseline drift'
    print(f'PASS {len(report)} reviewed body heights and baselines')
