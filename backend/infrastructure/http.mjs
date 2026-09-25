import { ApplicationError } from '../domain/errors.mjs';
const status={UNAUTHENTICATED:401,FORBIDDEN:403,NOT_FOUND:404,CONFLICT:409,VALIDATION:422,UNAVAILABLE:503};
async function boundedBody(request) {
  if(!request.body)return '';
  const reader=request.body.getReader();const chunks=[];let size=0;
  try {
    while(true) {
      const {done,value}=await reader.read();if(done)break;
      size+=value.byteLength;
      if(size>4096){await reader.cancel();return null;}
      chunks.push(value);
    }
  } finally {reader.releaseLock();}
  const bytes=new Uint8Array(size);let offset=0;
  for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  return new TextDecoder().decode(bytes);
}
export function createHandler({ serviceFactory, allowedOrigins }) {
  return async request => {
    const origin=request.headers.get('origin');
    const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin','X-Content-Type-Options':'nosniff'};
    if(origin && !allowedOrigins.includes(origin))return new Response(JSON.stringify({error:'Origen no autorizado.'}),{status:403,headers});
    if(origin)headers['Access-Control-Allow-Origin']=origin;
    headers['Access-Control-Allow-Headers']='authorization, apikey, content-type';
    headers['Access-Control-Allow-Methods']='GET, PATCH, OPTIONS';
    const respond=(value,code=200)=>new Response(JSON.stringify(value),{status:code,headers});
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
    const pathname=new URL(request.url).pathname;
    const prefix=/^(?:\/functions\/v1\/admin-api|\/admin-api|\/api)(?=\/|$)/.exec(pathname);
    if(!prefix)return respond({error:'Ruta no disponible.'},404);
    const path=pathname.slice(prefix[0].length);
    if(path==='/health' && request.method==='GET')return respond({status:'ok',architecture:'ports-and-adapters'});
    const token=/^Bearer (\S+)$/i.exec(request.headers.get('authorization')||'')?.[1];
    if(!token)return respond({error:'Inicia sesión nuevamente.',code:'UNAUTHENTICATED'},401);
    try {
      const service=serviceFactory(token);
      if(request.method==='GET') {
        if(path==='/readings')return respond(await service.listReadings(token));
        if(path==='/operations')return respond(await service.listOperations(token));
        if(path==='/activity')return respond(await service.getActivity(token));
      }
      if(request.method==='PATCH') {
        if(request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json')return respond({error:'Se requiere JSON.'},415);
        const raw=await boundedBody(request);
        if(raw===null)return respond({error:'Solicitud demasiado grande.'},413);
        let input;try{input=JSON.parse(raw);}catch{return respond({error:'JSON inválido.'},400);}
        if(!input || Array.isArray(input) || typeof input!=='object')return respond({error:'Objeto JSON requerido.'},400);
        if(path==='/settings')return respond(await service.updateSettings(token,input));
        const match=/^\/(maintenance|cases|incidents)\/([^/]+)$/.exec(path);
        if(match)return respond(await service.updateState(token,match[1],match[2],input));
      }
      return respond({error:'Ruta o método no disponible.'},404);
    }catch(error) {
      if(error instanceof ApplicationError)return respond({error:error.message,code:error.code},status[error.code]||500);
      return respond({error:'No se pudo completar la solicitud.',code:'INTERNAL'},500);
    }
  };
}
