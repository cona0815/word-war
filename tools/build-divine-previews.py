"""Compose approved sprite frames into cast/flight/impact GIF demonstrations."""
import json
from pathlib import Path
from PIL import Image,ImageEnhance

rows=json.loads(Path('docs/super-bosses/animation-sources.local.json').read_text(encoding='utf-8'))
output=Path('docs/super-bosses/animations');output.mkdir(exist_ok=True)
hero=Image.open('assets/generated/hero-weapons-normalized-v2/hero-male-lv1-starlight.png').convert('RGBA').resize((180,180),Image.Resampling.NEAREST)
for row in rows:
    if row['type']!='body':continue
    small=row['kind']=='small';root=Path('assets/generated/divine-beasts-v1');folder=root/row['id']
    body=[Image.open(folder/f'cast-{i+1}.png').convert('RGBA').resize((340,340),Image.Resampling.NEAREST) for i in range(row['frames'])]
    effect_folder=root/row['id'].replace('-body','-fx');effects=[Image.open(path).convert('RGBA') for path in sorted(effect_folder.glob('impact-*.png'))]
    step=130 if small else 160;release=(3 if small else 5)*step;flight=650;peak=2 if small else 3;duration=max(len(body)*step,release+flight+450)+250
    frames=[]
    for time in range(0,duration,80):
        canvas=Image.new('RGBA',(800,450),(11,35,52,255))
        current=hero if time<release+flight or time>release+flight+200 else ImageEnhance.Brightness(hero).enhance(1.7)
        canvas.alpha_composite(current,(35,225));canvas.alpha_composite(body[min(len(body)-1,time//step)],(450,55))
        age=time-release
        if 0<=age<flight:
            progress=age/flight;size=100 if small else 155
            effect=effects[min(len(effects)-1,1+int(progress*peak))].resize((size,size),Image.Resampling.NEAREST)
            x=int(530+(125-530)*progress);y=int(218+(305-218)*progress);canvas.alpha_composite(effect,(x-size//2,y-size//2))
        elif flight<=age<flight+330:
            index=min(len(effects)-1,peak+(age-flight)//110);size=135 if small else 225
            effect=effects[index].resize((size,size),Image.Resampling.NEAREST);canvas.alpha_composite(effect,(125-size//2,305-size//2))
        frames.append(canvas.convert('RGB'))
    path=output/(row['boss']+'-'+row['kind']+'.gif')
    frames[0].save(path,save_all=True,append_images=frames[1:],duration=80,loop=0,optimize=False)
    # Stable frame and contact sheet for visual review, no creative drawing.
    frames[min(len(frames)-1,(release+flight)//80)].save(output/(row['boss']+'-'+row['kind']+'-hit.png'))
    print(path)
