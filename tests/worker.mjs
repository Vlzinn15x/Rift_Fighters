import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import {readFileSync} from 'node:fs';
import worker from '../worker/index.ts';
const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('../migrations/0001_rooms.sql',import.meta.url),'utf8'));
const env={DB:{prepare(sql){return {bind(...args){return {run:()=>db.prepare(sql).run(...args),first:()=>db.prepare(sql).get(...args)}},first:()=>db.prepare(sql).get()}}},ASSETS:{fetch:async()=>new Response('asset')}};
const host=crypto.randomUUID(),guest=crypto.randomUUID(),outsider=crypto.randomUUID();
async function call(token,action,extra={}){const r=await worker.fetch(new Request('https://example.test/api/room',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,action,...extra})}),env);return {status:r.status,data:await r.json()};}
const made=await call(host,'create',{name:'Host',char:10});assert.equal(made.status,200);const code=made.data.code;assert.equal(code.length,8);
const joined=await call(guest,'join',{code,name:'Guest',char:9});assert.equal(joined.data.hostChar,10);assert.equal(joined.data.guestChar,9);assert.equal(joined.data.role,'guest');
assert.equal((await call(outsider,'join',{code})).status,403);
await call(host,'ready',{code,char:10});const ready=await call(guest,'ready',{code,char:9});assert(ready.data.started>Date.now());
await call(host,'sync',{code,snapshot:{round:1,fighters:[{id:10},{id:9}]}});const state=await call(guest,'sync',{code,input:{d:true}});assert.equal(JSON.parse(state.data.snapshot).fighters[0].id,10);assert.equal(JSON.parse((await call(host,'sync',{code})).data.input).d,true);
assert.equal((await call(host,'leave',{code})).data.ok,true);assert.equal((await call(guest,'sync',{code})).status,404);
assert.equal((await worker.fetch(new Request('https://example.test/'),env)).status,200);assert.equal((await worker.fetch(new Request('https://example.test/api/room'),env)).status,405);assert.equal((await call('bad-token','create')).status,400);
console.log('PASS: standalone Worker rooms create/join/authorization/ready/sync/leave, characters 9/10, asset routing and invalid requests');
