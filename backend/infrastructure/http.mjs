import { ApplicationError } from '../domain/errors.mjs';
const status={UNAUTHENTICATED:401,FORBIDDEN:403,NOT_FOUND:404,CONFLICT:409,VALIDATION:422,UNAVAILABLE:503};
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
    const path=new URL(request.url).pathname.replace(/^\/functions\/v1\/admin-api|^\/admin-api|^\/api/,'');
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
        if(!request.headers.get('content-type')?.startsWith('application/json'))return respond({error:'Se requiere JSON.'},415);
        const raw=await request.text();
        if(raw.length>4096)return respond({error:'Solicitud demasiado grande.'},413);
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
