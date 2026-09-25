import { createServer } from 'node:http';
import { compose } from './bootstrap.mjs';
const handler=compose({url:process.env.SUPABASE_URL,publicKey:process.env.SUPABASE_PUBLISHABLE_KEY,allowedOrigins:(process.env.API_ALLOWED_ORIGINS||'http://127.0.0.1:8000,http://localhost:8000').split(',')});
const port=Number(process.env.API_PORT||8787);
createServer(async(req,res)=>{
  try {
    const chunks=[];let size=0;
    for await (const chunk of req){size+=chunk.length;if(size>4096){res.writeHead(413);res.end();return;}chunks.push(chunk);}
    const response=await handler(new Request(`http://127.0.0.1:${port}${req.url}`,{method:req.method,headers:req.headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(chunks)})}));
    res.writeHead(response.status,Object.fromEntries(response.headers));res.end(await response.text());
  } catch {res.writeHead(500);res.end('Internal error');}
}).listen(port,'127.0.0.1',()=>console.log(`API hexagonal: http://127.0.0.1:${port}/api`));
