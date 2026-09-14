import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const workspace=fileURLToPath(new URL('..',import.meta.url)),port=Number(process.argv[2]||8767);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.mp4':'video/mp4','.wav':'audio/wav','.mp3':'audio/mpeg','.json':'application/json'};
http.createServer((req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(workspace,'.'+(pathname==='/'?'/index.html':pathname));
  const relative=path.relative(workspace,file);
  if(relative.startsWith('..')||path.isAbsolute(relative)){res.writeHead(403).end();return}
  const stat=fs.statSync(file);if(!stat.isFile())throw Error('not file');
  const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache'};
  let start=0,end=stat.size-1,code=200;
  if(req.headers.range){
   const match=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
   if(!match){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`}).end();return}
   start=Number(match[1]);end=match[2]?Math.min(end,Number(match[2])):end;
   if(start>end||start>=stat.size){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`}).end();return}
   code=206;headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;
  }
  res.writeHead(code,{...headers,'Content-Length':end-start+1});
  if(req.method==='HEAD'){res.end();return}
  fs.createReadStream(file,{start,end}).pipe(res);
 }catch{res.writeHead(404).end('Not found')}
}).listen(port,'127.0.0.1',()=>console.log(`Word War http://127.0.0.1:${port}`));
