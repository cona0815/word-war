"""Validate production frames without changing images."""
from pathlib import Path
from PIL import Image
folders = sorted(Path('assets/generated/minion-views-v1').iterdir())
assert len(folders) == 38, len(folders)
folders += [Path('assets/generated/minion-directions-v1')]
for folder in folders:
    bottoms = []
    for i in range(1, 5):
        with Image.open(folder / f'idle-{i}.png') as image:
            assert image.size == (256, 256), folder
            assert image.mode == 'RGBA', folder
            alpha = image.getchannel('A')
            box = alpha.getbbox()
            assert box and min(box[:2]) > 0 and max(box[2:]) < 256, (folder, box)
            assert alpha.getpixel((0, 0)) == 0, folder
            bottoms.append(box[3])
    assert max(bottoms) - min(bottoms) <= 1, (folder, bottoms)
print('PASS 156 transparent PNGs, safe margins and consistent feet anchors')
