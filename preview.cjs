'use strict';
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
function createServer(){
 const root=path.resolve(__dirname,'site');
 return http.createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});return res.end();}
  try{
   const pathname=new URL(req.url,'http://localhost').pathname;
   if(pathname==='/'){res.writeHead(302,{Location:'/DamDaTest/'});return res.end();}
   if(!pathname.startsWith('/DamDaTest/'))throw Error('Not found');
   const file=path.resolve(root,decodeURIComponent(pathname.slice(11))||'index.html');
   const relative=path.relative(root,await fs.realpath(file));
   if(relative.startsWith('..')||path.isAbsolute(relative))throw Error('Not found');
   const data=await fs.readFile(file);
   const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
   res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(req.method==='HEAD'?undefined:data);
  }catch{res.writeHead(404);res.end('Not found');}
 });
}
if(require.main===module){const server=createServer();server.on('error',e=>{console.error(e.message);process.exitCode=1;});server.listen(4174,'127.0.0.1',()=>console.log('DamDa Design Lab: http://127.0.0.1:4174/DamDaTest/'));}
module.exports={createServer};
