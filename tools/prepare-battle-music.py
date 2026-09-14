"""Extract three energetic, separated passages from each user-supplied song."""
import argparse, hashlib, json, subprocess
from pathlib import Path
import numpy as np
parser=argparse.ArgumentParser()
parser.add_argument('--source',type=Path,default=Path.home()/'Downloads')
parser.add_argument('--ffmpeg',default=r'C:\Python310\lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe')
args=parser.parse_args()
tracks=[('battle-early','一般戰鬥｜校園初戰.mp3'),('battle-mid','一般戰鬥｜雙星魔法巡邏.mp3'),('battle-late','般戰鬥｜八景守護衝刺.mp3'),('boss-early','小魔王戰｜寶石守衛甦醒.mp3'),('boss-mid','符文反擊.mp3'),('boss-late','小魔王戰｜八景寶石決戰.mp3')]
output=Path('assets/music');output.mkdir(parents=True,exist_ok=True)
manifest={'version':1,'groups':{}}
report=[]
for key,filename in tracks:
 source=args.source/filename
 raw=subprocess.check_output([args.ffmpeg,'-v','error','-i',str(source),'-f','f32le','-ac','1','-ar','8000','pipe:1'])
 samples=np.frombuffer(raw,dtype='<f4');duration=len(samples)/8000
 length=min(24.0,int((duration-3)/3));assert length>=10,filename
 # Search each third independently; maximize average RMS, avoiding quiet tails.
 rms=np.array([np.sqrt(np.mean(samples[i:i+8000]**2)) for i in range(0,len(samples),8000)])
 starts=[]
 for part in range(3):
  low=max(1,int(part*duration/3));high=min(int((part+1)*duration/3-length),int(duration-length-1))
  choices=range(low,max(low,high)+1)
  start=max(choices,key=lambda t:float(np.mean(rms[t:t+int(length)])))
  starts.append(start)
 clips=[]
 for n,start in enumerate(starts,1):
  name=f'{key}-{n:02}.mp3'
  subprocess.run([args.ffmpeg,'-v','error','-y','-ss',str(start),'-i',str(source),'-t',str(length),'-map_metadata','-1','-af',f'loudnorm=I=-20:TP=-2:LRA=9,afade=t=in:d=0.25,afade=t=out:st={length-.6}:d=0.6','-ar','44100','-ac','2','-c:a','libmp3lame','-b:a','128k',str(output/name)],check=True)
  clips.append({'src':f'assets/music/{name}','duration':length,'label':f'{filename[:-4]}・段落 {n}'})
 manifest['groups'][key]=clips
 report.append({'group':key,'source':filename,'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'sourceDuration':round(duration,3),'starts':starts,'clipDuration':length})
 print(key,round(duration,1),starts,length,flush=True)
(output/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
Path('docs/music-cuts.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
