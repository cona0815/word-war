"""Postprocess ImageGen body/FX sheets with stable transparent frame output."""
import argparse
import concurrent.futures
import json
from pathlib import Path
import subprocess
import sys

p=argparse.ArgumentParser()
p.add_argument('--processor',required=True)
p.add_argument('--sources',default='docs/super-bosses/animation-sources.local.json')
a=p.parse_args()
rows=json.loads(Path(a.sources).read_text(encoding='utf-8'))
def process(row):
    target=Path('assets/generated/divine-beasts-v1')/row['id']
    mode='cast' if row['type']=='body' else 'impact'
    command=[sys.executable,a.processor,'process','--input',row['path'],'--target','creature' if row['type']=='body' else 'asset','--mode',mode,
        '--rows',str(row['rows']),'--cols',str(row['cols']),'--cell-size','512','--fit-scale','0.8',
        '--align','feet' if row['type']=='body' else 'center','--shared-scale',
        '--component-mode','largest' if row['type']=='body' else 'all','--reject-edge-touch',
        '--duration','130' if row['kind']=='small' else '160','--output-dir',str(target)]
    result=subprocess.run(command,capture_output=True,text=True)
    if result.returncode:print('FAIL '+row['id']+': '+result.stderr.splitlines()[-1],flush=True);return False
    (target/'prompt-used.txt').write_text(row['prompt']+'\n',encoding='utf-8')
    print('PASS '+row['id'],flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    results=list(pool.map(process,rows))
if any(result is False for result in results):sys.exit(1)
