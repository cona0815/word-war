"""Rescale reviewed body silhouettes, retaining the source art and joint poses."""
from pathlib import Path
import json
import sys
import numpy as np
from PIL import Image

root = Path(__file__).resolve().parents[1]
records = json.loads((root/'docs/qa-body-scale/measurements.json').read_text())
reports = []
for r in records:
    if len(sys.argv)>1 and r['folder']!=sys.argv[1]:
        continue
    if r['folder'].endswith('-body-v2'):
        r = json.loads((root/'assets/generated'/r['folder']/'body-scale.json').read_text())
    source = root/'assets/generated'/r['folder']
    strip = Image.open(source/'cast-strip.png').convert('RGBA')
    factor = 460/r['bodyHeight']
    result = Image.new('RGBA',(1152*6,648))
    frames=[]
    for i in range(6):
        frame=strip.crop((i*r['width'],0,(i+1)*r['width'],648))
        a=np.asarray(frame)[:,:,3]
        ys,xs=np.where(a>128)
        bottom=int(ys.max())+1
        fy,fx=np.where(a[max(0,bottom-10):bottom]>128)
        footx=float((fx.min()+fx.max())/2)
        box=frame.getbbox()
        crop=frame.crop(box)
        crop=crop.resize((round(crop.width*factor),round(crop.height*factor)),Image.Resampling.LANCZOS)
        at=(round(576-(footx-box[0])*factor),round(610-(bottom-box[1])*factor))
        assert min(at)>0 and at[0]+crop.width<1152 and at[1]+crop.height<648,(r['key'],i,at,crop.size)
        cell=Image.new('RGBA',(1152,648));cell.alpha_composite(crop,at)
        frames.append(cell);result.alpha_composite(cell,(i*1152,0))
    out=source.with_name(source.name+'-body-v2');out.mkdir(exist_ok=True)
    result.save(out/'cast-strip.png');frames[0].save(out/'idle.png')
    region=source/'body-region.json'
    if region.exists():
        mapped=json.loads(region.read_text())
        mapped['left']*=factor
        mapped['right']*=factor
        (out/'body-region.json').write_text(json.dumps(mapped,indent=2))
    record={**r,'factor':factor,'targetBodyHeight':460,'output':out.name}
    (out/'body-scale.json').write_text(json.dumps(record,indent=2))
    reports.append(record)
print(json.dumps(reports,indent=2))
