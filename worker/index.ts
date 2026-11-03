interface Env {DB:any;ASSETS:{fetch(request:Request):Promise<Response>}}
type RoomRequest={token?:unknown;name?:unknown;char?:unknown;action?:unknown;code?:unknown;snapshot?:unknown;input?:Record<string,unknown>};
const out=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
async function roomRequest(req:Request,env:Env){try{
 const b=await req.json() as RoomRequest;const db=(env as any).DB;
 if(typeof b.token!=='string'||!/^[a-f0-9-]{36}$/.test(b.token))return out({error:'Sessão inválida.'},400);
 const name=String(b.name||'Lutador').slice(0,20),char=Math.max(0,Math.min(10,Math.floor(Number(b.char))||0));
 if(b.action==='create'){
  const code=crypto.randomUUID().replace(/-/g,'').slice(0,8).toUpperCase();
  await db.prepare('INSERT INTO rooms (code,host,host_name,host_char,updated) VALUES (?,?,?,?,?)').bind(code,b.token,name,char,Date.now()).run();return out({code});
 }
 const code=String(b.code||'').toUpperCase();let r=await db.prepare('SELECT * FROM rooms WHERE code=?').bind(code).first();
 if(!r||Date.now()-r.updated>3600000)return out({error:'Sala não encontrada ou expirada.'},404);
 if(b.action==='join'){
  await db.prepare('UPDATE rooms SET guest=?,guest_name=?,guest_char=?,updated=? WHERE code=? AND (guest IS NULL OR guest=?) AND host!=?').bind(b.token,name,char,Date.now(),code,b.token,b.token).run();
  r=await db.prepare('SELECT * FROM rooms WHERE code=?').bind(code).first();
 }
 const host=r.host===b.token,guest=r.guest===b.token;if(!host&&!guest)return out({error:'Esta sala já está cheia.'},403);
 if(b.action==='choose'&&!r.started)await db.prepare(host?'UPDATE rooms SET host_char=?,host_ready=0 WHERE code=?':'UPDATE rooms SET guest_char=?,guest_ready=0 WHERE code=?').bind(char,code).run();
 if(b.action==='ready'&&!r.started){await db.prepare(host?'UPDATE rooms SET host_char=?,host_ready=1 WHERE code=?':'UPDATE rooms SET guest_char=?,guest_ready=1 WHERE code=?').bind(char,code).run();await db.prepare('UPDATE rooms SET started=?,map=? WHERE code=? AND host_ready=1 AND guest_ready=1 AND started=0').bind(Date.now()+4200,crypto.getRandomValues(new Uint32Array(1))[0]%4,code).run();}
 if(b.action==='sync'){
  if(host&&b.snapshot&&JSON.stringify(b.snapshot).length<100000)await db.prepare('UPDATE rooms SET snapshot=?,updated=? WHERE code=?').bind(JSON.stringify(b.snapshot),Date.now(),code).run();
  if(guest&&b.input){b.input.receivedAt=Date.now();await db.prepare('UPDATE rooms SET input=?,updated=? WHERE code=?').bind(JSON.stringify(b.input),Date.now(),code).run();}
 }
 if(b.action==='leave'){if(host)await db.prepare('DELETE FROM rooms WHERE code=?').bind(code).run();else await db.prepare('UPDATE rooms SET guest=NULL,guest_name=NULL,guest_ready=0,started=0,snapshot=NULL,input=NULL WHERE code=?').bind(code).run();return out({ok:true});}
 r=await db.prepare('SELECT * FROM rooms WHERE code=?').bind(code).first();
 return out({code,role:host?'host':'guest',hostName:r.host_name,guestName:r.guest_name,hostChar:r.host_char,guestChar:r.guest_char,hostReady:r.host_ready,guestReady:r.guest_ready,started:r.started,map:r.map,snapshot:host?null:r.snapshot,input:host?r.input:null});
 }catch{return out({error:'Não foi possível conectar à sala. Tente novamente.'},500)}}

export default {async fetch(req:Request,env:Env):Promise<Response>{
 const url=new URL(req.url);
 if(url.pathname==='/api/room'){
  if(req.method!=='POST')return out({error:'Use POST.'},405);
  if(!env.DB)return out({error:'Banco das salas não configurado.'},503);
  return roomRequest(req,env);
 }
 return env.ASSETS.fetch(req);
}};
