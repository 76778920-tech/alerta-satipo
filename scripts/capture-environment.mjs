// Mismo adaptador que la API; salida privada para SQLite y comprobación local.
import {PublicEnvironment} from '../backend/adapters/out/environment.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
const result=await new PublicEnvironment({firmsKey:process.env.FIRMS_MAP_KEY||process.env.NASA_FIRMS_MAP_KEY}).snapshot();
await mkdir('var',{recursive:true});
const file=`var/environment-${Date.now()}.json`;
await writeFile(file,JSON.stringify(result,null,2),{flag:'wx'});
console.log(JSON.stringify({file,weather:result.weather.status,weather_rows:result.weather.rows.length,firms:result.fires.status,detections:result.fires.rows.length}));
if(result.weather.status!=='ok'&&result.fires.status!=='ok')process.exitCode=1;
