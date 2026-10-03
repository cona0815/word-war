"""Process approved ImageGen sheets; never generates or redraws sprite art."""
import argparse
import concurrent.futures
import json
from pathlib import Path
import subprocess
import sys

p = argparse.ArgumentParser()
p.add_argument('--sources', required=True)
p.add_argument('--processor', required=True)
a = p.parse_args()
sources = json.loads(Path(a.sources).read_text(encoding='utf-8'))

def process(row):
    target = Path('assets/generated/minion-views-v1') / row['name']
    subprocess.run([sys.executable, a.processor, 'process', '--input', row['path'],
        '--target', 'creature', '--mode', 'idle', '--rows', '2', '--cols', '2',
        '--cell-size', '256', '--fit-scale', '0.8', '--align', 'feet',
        '--shared-scale', '--component-mode', 'largest', '--reject-edge-touch',
        '--output-dir', str(target)], check=True, capture_output=True)
    meta = json.loads((target / 'pipeline-meta.json').read_text(encoding='utf-8'))
    print('PASS', row['name'], flush=True)
    return meta

with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    list(pool.map(process, sources))
