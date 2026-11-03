'use strict';
combatSets.push(
 {names:['Soco do Churras','Direto da Picanha','Vira o Espetinho','Fecha a Churrasqueira'],damage:[5,6,8,12],reach:[69,76,85,106],tempo:1.05,special:'CHURRASCO CÓSMICO',line:'Passou do ponto? Então toma esse combo!'},
 {names:['Bom Dia, Grupo!','Figurinha Repetida','Áudio de Cinco Minutos','Sai do Meu Grupo!'],damage:[5,6,8,12],reach:[69,76,85,106],tempo:1.05,special:'CHUVA DE FIGURINHAS',line:'Esse combo foi encaminhado muitas vezes!'},
 {names:['Corte de Zangetsu','Corte Reverso','Ascensão Espiritual','Ruptura Getsuga'],damage:[5,6,8,12],reach:[91,99,105,126],tempo:1.02,special:'GETSUGA FINAL',line:'Eu vou proteger quem está ao meu lado!'}
);
introLines.push(['Trouxe o carvão. Quem trouxe o combo?','Agora o churrasco ficou sério!'],['Bom dia, grupo da arena!','Não vale silenciar o meu especial!'],['Zangetsu, vamos nessa.','Bankai!']);
Object.assign(signatureRoutes,{8:{key:0,name:'COMBO DO ESPETINHO',recipe:'M1 → M1 → Z',detail:'Acerte dois golpes e encadeie uma Picanha Meteórica reforçada.'},9:{key:1,name:'ENCAMINHADO COM IMPACTO',recipe:'M1 → M1 → X',detail:'Acerte dois golpes e cancele em uma investida reforçada.'},10:{key:0,name:'CORTE DO CRESCENTE',recipe:'M1 → M1 → Z',detail:'Acerte dois cortes, depois Getsuga Tenshō. Bankai acelera o combo.'}});
function trioRow(f){return f.id===10&&f.formTime>0?f.formTier===2?4:3:f.id-8;}
function trioColor(f){return f.id===10&&f.formTime>0?'#ff647e':f.r.color;}
function trioIconStyle(id,frame=6){return 'background-image:url(assets/trio-combat-v27.png);background-size:800% 500%;background-position:'+(frame*100/7)+'% '+((id===10?4:id-8)*25)+'%';}
function trioCombatFrame(f){if(specialScene&&specialScene.owner===fighters.indexOf(f))return specialScene.age<.58?1:specialScene.age<1.65?6:7;if(f.skillAnim){const p=skillProgress(f);return p<.23?1:p<.65?6:7;}if(activeMelee(f)){const p=f.attackAge/f.attackTotal,s=f.attackState.step;return p<.25?[1,3,3,1][s]:p<.62?[2,4,5,6][s]:7;}return f.guard||f.stun>0?1:0;}
function drawTrioSprite(f,t,alpha,height){if(!trioCombatArt.complete||!trioCombatArt.naturalWidth)return;const row=trioRow(f),walking=f.moving&&!f.skillAnim&&!specialScene&&!f.preview&&f.y===424&&f.attack<=0&&f.dash<=0&&trioWalkArt.complete&&trioWalkArt.naturalWidth;c.save();c.globalAlpha=Math.max(0,Math.min(1,alpha));if(!f.preview&&alpha===1){c.fillStyle='#02061780';c.beginPath();c.ellipse(f.x,427,24,4,0,0,Math.PI*2);c.fill();}c.translate(Math.round(f.x),Math.round(f.y));c.scale(f.face,f.preview?1:renderRatio);const pose=trioPoseMotion(f);c.translate(pose.x,pose.y);c.rotate(pose.rot);if(f.hitReact>.19)c.filter='brightness(1.6)';else if(f.formTime>0)c.filter='brightness(1.1)';if(walking){const meta=trioWalkSheets[row];drawGaitCell(trioWalkArt,meta,meta.frames[groundedFrame(f)],height);}else{const meta=trioCombatSheets[row],frame=trioCombatFrame(f);drawGaitCell(trioCombatArt,meta,meta.frames[frame],height);}c.restore();if(f.guard&&!f.preview)shockRing(f.x,f.y-36,32,f.r.color,.5,1.1);}
function tuneTrioAttack(f){if(f.formTime<=0)return;f.attackState.damage*=f.formTier===2?1.2:1.12;f.attackState.range+=f.id===10?10:4;}
function activateTrioForm(f,duration,tier=1){const active=f.formTime>0;f.formTier=Math.max(active?f.formTier||1:0,tier);f.formTime=Math.max(f.formTime||0,duration);f.formTotal=Math.max(f.formTotal||0,duration);f.formEntry=0;f.form=['stellar','fortress','bankai'][f.id-8];if(f.id===8){f.shield=Math.max(f.shield,18);f.shieldTime=Math.max(f.shieldTime,4);}if(f.id===9){f.shield=Math.max(f.shield,25);f.shieldTime=Math.max(f.shieldTime,4);}effect('trioBurst',f.x,f.y-37,f.r.color,.7,{id:f.id,dir:f.face,size:135});spectacle('charge',f.x,f.y-40,f.id,.7,95);}
function castTrio(f,index){if(mode!=='fight'||specialScene||index<0||index>2)return false;const skill=f.r.skills[index],target=fighters[1-fighters.indexOf(f)];if(f.cd[index]>0||f.en<skill[4]||f.stun>0||f.dash>0||f.melee>0||activeMelee(f))return false;cancelMelee(f);const route=takeSignature(f,index);f.en-=skill[4];f.cd[index]=skill[3];f.kind='cast';f.guard=false;beginSkillAnimation(f,index);powerSound(f.id,index);const type=skill[6],col=trioColor(f);effect('trioCharge',f.x,f.y-35,col,.25,{id:f.id,dir:f.face});
 if(['redfist','redhook','greenburst','getsuga'].includes(type)){const n=type==='greenburst'?3:1;for(let j=0;j<n;j++){const shot={x:f.x+f.face*33,y:f.y-34,dir:f.face,owner:f,type,launchDelay:.12+j*.14,life:2.7,age:0,vx:type==='getsuga'?430:470,damage:skill[5]*(route?1.35:1)*(f.formTime>0?1.12:1),radius:type==='getsuga'?35:23,signature:!!route};aimGuestShot(shot,target);shots.push(shot);}}
 if(type==='greenrush'){f.melee=0;dash(f,skill[5]*(route?1.35:1));effect('trioRush',f.x,f.y-35,col,.4,{owner:f,id:f.id,dir:f.face});}
 if(type==='shunpo'){f.trioBlink={age:0,damage:skill[5],target:fighters.indexOf(target)};f.inv=Math.max(f.inv,.14);}
 if(['stellar','fortress','bankai'].includes(type)){activateTrioForm(f,type==='bankai'?14:12);beginSkillAnimation(f,index,.6);}
 if(route)effect('trioBurst',target.x,target.y-35,col,.6,{id:f.id,dir:f.face,size:180});return true;
}
function onTrioShotHit(s,t){if(s.type==='redhook'){const gap=Math.abs(t.x-s.owner.x),pull=Math.min(65,Math.max(0,gap-47));t.x=Math.max(35,Math.min(925,t.x-Math.sign(t.x-s.owner.x)*pull));}if(s.type==='redhook')effect('trioLink',t.x,t.y-35,s.owner.r.color,.35,{owner:s.owner,target:fighters.indexOf(t),id:8});effect('trioBurst',t.x,t.y-35,trioColor(s.owner),.4,{id:s.owner.id,dir:s.dir,size:s.type==='getsuga'?140:95});}
function drawTrioEnergy(id,x,y,w,h,age,alpha=1,flip=1){const f=fighters.find(f=>f.id===id),col=f?trioColor(f):roster[id].color;c.save();c.translate(x,y);c.scale(flip,renderRatio);c.globalAlpha*=Math.max(0,alpha);const pulse=1+Math.sin(age*18)*.06,r=w*.27;if(id===10){const pts=[];for(let j=0;j<15;j++){const a=-1.4+j*.2;pts.push([Math.cos(a)*r*1.25-r*.6,Math.sin(a)*h*.4]);}pixelStroke(pts,w*.13,'#151526',.95);pixelStroke(pts,w*.055,col,.95);pixelStroke(pts,w*.014,'#fff3d2',.9);}else{hitStar(0,0,r*pulse,col,0,.8);hitStar(0,0,r*.42,'#fff8db',0,.9);shockRing(0,0,r*1.4,col,.5,.8);}c.restore();}
function drawTrioShot(s,t){if(s.launchDelay>0)return;if(s.type==='redhook'){const pts=[];for(let n=0;n<12;n++)pts.push([s.x-s.dir*n*6,s.y+Math.sin(n*.7-t*15)*n*.9]);pixelStroke(pts,4,s.owner.r.color,.8);pixelStroke(pts,1,'#fff4ce',.9);shockRing(s.x,s.y,12,s.owner.r.color,.9,1);return;}drawTrioEnergy(s.owner.id,s.x,s.y,s.type==='getsuga'?115:s.type==='redhook'?80:65,s.type==='getsuga'?125:65,s.age||0,1,s.dir);const col=trioColor(s.owner);for(let j=0;j<5;j++){const u=(t*3+j*.2)%1;rect(s.x-s.dir*u*65,s.y+Math.sin(j*4+t*12)*u*14,3,2,col+'aa');}}
function drawTrioEffect(e,t){if(e.wait>0)return;const k=1-e.life/e.total,fade=Math.sin(k*Math.PI),id=e.id||8,col=e.col;if(e.type==='trioArc'){c.save();c.translate(e.x,e.y);c.scale(e.dir,renderRatio);const pts=[];for(let n=0;n<12;n++){const a=-2+k*2+n*.16;pts.push([Math.cos(a)*70,Math.sin(a)*40]);}pixelStroke(pts,8,col,.25*(1-k));pixelStroke(pts,3,'#fff2d2',1-k);c.restore();return;}if(e.type==='trioRush'){drawTrioEnergy(id,e.owner.x-e.dir*20,e.owner.y-35,100,100,k,.7*(1-k),e.dir);return;}if(e.type==='trioPortal'){shockRing(e.x,e.y,35+15*Math.sin(k*Math.PI),col,fade,1.3);return;}if(e.type==='trioLink'){const target=fighters[e.target],owner=e.owner;if(target&&owner){const pts=[];for(let n=0;n<=12;n++){const u=n/12;pts.push([owner.x+(target.x-owner.x)*u,owner.y-32+(target.y-owner.y)*u+Math.sin(u*Math.PI)*Math.sin(k*10)*12]);}pixelStroke(pts,4,col,1-k);pixelStroke(pts,1,'#fff1ce',1-k);}return;}const size=e.size||65;drawTrioEnergy(id,e.x,e.y,size*(.6+k*.5),size,k,fade,e.dir||1);if(e.type==='trioBurst'){shockRing(e.x,e.y,size*k*.6,col,1-k,.7);for(let n=0;n<8;n++){const a=n*Math.PI/4;shard(e.x+Math.cos(a)*k*size*.5,e.y+Math.sin(a)*k*size*.35,4,a,col,1-k);}}}
function drawTrioAura(f,t){const col=trioColor(f);sigil(f.x,425,f.formTier===2?43:32,col,t*.7,.4);for(let n=0;n<5;n++){const u=(t*.9+n*.2)%1;rect(f.x+Math.sin(n*2.4+t)*25,f.y-8-u*68,2,4,col+(f.formTier===2?'bb':'77'));}if((f.formEntry||0)<1)shockRing(f.x,f.y-38,25+f.formEntry*55,col,1-f.formEntry,.9);}
function drawTrioHud(f,i){if(f.formTime<=0)return;const x=i?800:30,label=f.id===8?'CHURRASQUEIRO':f.id===9?'TIO DO ZAP':f.formTier===2?'HOLLOW BANKAI':'BANKAI';rect(x,119,130,22,'#071020dd');rect(x,139,130*f.formTime/f.formTotal,2,f.r.color);text(label+' '+Math.ceil(f.formTime)+'s',x+5,133,8,f.r.color);}
function drawTrioSpecial(e,t){const f=fighters[e.owner],target=fighters[1-e.owner],k=Math.max(0,(e.age-.58)/1.57),col=trioColor(f);if(e.age<.58){drawTrioEnergy(f.id,f.x,f.y-45,90,90,e.age,.8,f.face);return;}drawTrioEnergy(f.id,target.x,target.y-40,220,230,k,Math.sin(k*Math.PI),f.face);for(let n=0;n<3;n++)pixelStroke([[f.x,f.y-35+n*9],[target.x,target.y-35+n*9]],n===1?3:1,col,Math.sin(k*Math.PI)*.5);}
const styleBeforeTrio=registerStyleHit;registerStyleHit=function(f,t,step=0){styleBeforeTrio(f,t,step);if(f.id===10&&step===2){t.vy=-260;t.y=Math.min(t.y,420);}};
const galleryBeforeTrio=updatePowerGallery;updatePowerGallery=function(id){if(id<8)return galleryBeforeTrio(id);galleryBeforeGuests(id);document.querySelectorAll('.power-art').forEach((el,i)=>{el.style.backgroundImage='url(assets/trio-combat-v27.png)';el.style.backgroundSize='800% 500%';el.style.backgroundPosition=([2,4,6][i]*100/7)+'% '+((id===10&&i===2?3:id-8)*25)+'%';});};
// Whole-body posing: source frames remain intact; motion settles before locomotion.
function trioPoseMotion(f){
 if(f.preview)return{x:0,y:0,rot:0};
 if(activeMelee(f)){const p=Math.min(1,f.attackAge/f.attackTotal),step=f.attackState.step,drive=Math.sin(p*Math.PI),snap=Math.sin(Math.min(1,p/.38)*Math.PI);return{x:(p<.28?-3:3)*drive,y:-Math.sin(p*Math.PI)*(step===2?7:2),rot:(step===1?-.08:.065)*snap};}
 if(f.skillAnim){const p=skillProgress(f),v=Math.sin(p*Math.PI);return{x:p<.25?-3*v:2*v,y:f.skillAnim.index===2?-4*v:0,rot:f.skillAnim.index===2?0:-.035*v};}
 return{x:0,y:0,rot:0};
}
function trioSteak(x,y,size,angle=0,alpha=1){c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha*=Math.max(0,alpha);const q=size/32;c.scale(q,q);pixelStroke([[-13,-8],[-4,-13],[10,-9],[15,1],[8,11],[-8,10],[-15,3],[-13,-8]],6,'#ffcf9e',1);pixelStroke([[-11,-6],[-3,-10],[8,-7],[11,1],[6,8],[-7,7],[-11,2],[-11,-6]],5,'#a82b32',1);for(let j=0;j<3;j++)pixelStroke([[-8+j*6,-5],[-5+j*5,5]],2,'#421f2f',1);rect(-6,-6,4,2,'#ffe8b4');c.restore();}
function trioMessage(x,y,size,angle=0,alpha=1,index=0){c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha*=Math.max(0,alpha);const q=size/32;c.scale(q,q);rect(-17,-13,34,25,'#073c32');rect(-15,-15,30,27,'#7dffa9');rect(-12,-12,24,20,'#1b875b');pixelStroke([[-10,10],[-13,17],[-2,11]],3,'#7dffa9');for(let j=0;j<3;j++)rect(-8+j*7,-3+(j===index? -2:0),4,4,'#efffcd');c.restore();}
const trioEnergyV27=drawTrioEnergy;
drawTrioEnergy=function(id,x,y,w,h,age,alpha=1,flip=1){
 if(id===8)return trioSteak(x,y,Math.min(110,w*.65),age*8*flip,alpha);
 if(id===9)return trioMessage(x,y,Math.min(100,w*.65),Math.sin(age*8)*.18,alpha,Math.floor(age*8)%3);
 const f=fighters.find(f=>f.id===10),bankai=f&&f.formTime>0,col=bankai?'#ff315d':'#7eeaff';
 c.save();c.translate(x,y);c.scale(flip,renderRatio);c.globalAlpha*=Math.max(0,alpha);
 for(let layer=4;layer>=0;layer--){const pts=[],r=w*(.31+layer*.035);for(let n=0;n<=24;n++){const a=-1.48+n*2.96/24;pts.push([Math.cos(a)*r-r*.58-layer*3,Math.sin(a)*h*.43]);}pixelStroke(pts,layer===0?2:layer===1?5:layer===2?13:20,layer===0?'#f1ffff':layer===1?col:bankai?'#180d2c':col,layer>2?.12:layer===2?.95:1);}
 for(let n=0;n<12;n++){const u=(age*2+n/12)%1;pixelStroke([[-u*w*.9-12,Math.sin(n*2+age*10)*h*.25],[-u*w*.9+8,Math.sin(n*2+age*10)*h*.25]],1,col,(1-u)*.8);}
 c.restore();
};
const trioFxV27=drawTrioEffect;
drawTrioEffect=function(e,t){
 if(e.wait>0)return;const p=Math.max(0,Math.min(1,1-e.life/e.total)),a=Math.sin(p*Math.PI);
 if(e.type==='trioArc'){
  const f=fighters[e.fighterIndex];if(!f||!activeMelee(f)||f.moving)return;
  c.save();c.translate(f.x+e.dir*12,f.y-38);c.scale(e.dir,renderRatio);
  const step=e.step||0,r=step===3?87:step===2?64:54,pts=[];
  for(let n=0;n<=18;n++){const q=n/18,ang=(step===1?1:-1)*(-1.8+q*2.9+p*.75);pts.push([Math.cos(ang)*r,Math.sin(ang)*(step===2?57:32)]);}
  const col=e.id===10?(f.formTime>0?'#ff315d':'#9ceeff'):e.col;
  pixelStroke(pts,step===3?17:10,col,.2*(1-p));pixelStroke(pts,5,col,1-p);pixelStroke(pts,1,'#fff8da',1-p);
  if(e.id!==10){if(e.id===8)trioSteak(pts[14][0],pts[14][1],20,p*8,.7*(1-p));else trioMessage(pts[14][0],pts[14][1],19,p*3,.7*(1-p));}
  c.restore();return;
 }
 if(e.type==='trioBurst'){
  const size=e.size||95;shockRing(e.x,e.y,size*p*.65,e.col,1-p,.5);
  for(let n=0;n<12;n++){const ang=n*Math.PI/6,r=size*(.1+p*.6),x=e.x+Math.cos(ang)*r,y=e.y+Math.sin(ang)*r*.65;pixelStroke([[x,y],[x+Math.cos(ang)*(12+16*p),y+Math.sin(ang)*13]],n%3?2:4,e.col,1-p);}
  if(e.id===10){for(let j=-1;j<=1;j++)pixelStroke([[e.x-60*p,e.y+j*11+55*p],[e.x+60*p,e.y+j*11-55*p]],j===0?6:2,j===0?'#f1ffff':e.col,1-p);}else{for(let n=0;n<5;n++){const ang=n*1.256+p*.7,r=p*size*.5;(e.id===8?trioSteak:trioMessage)(e.x+Math.cos(ang)*r,e.y+Math.sin(ang)*r*.6,15+12*(1-p),p*8+n,(1-p)*.8,n%3);}}
  return;
 }
 if(e.type==='trioPortal'&&e.id===10){for(let n=0;n<12;n++){const x=e.x+(n-5.5)*4;pixelStroke([[x-10,e.y-46+n%3*5],[x+10,e.y+43-n%3*8]],n%3?1:3,n%2?'#f1ffff':e.col,a);}return;}
 if(e.type==='trioRush'){const f=e.owner;for(let n=0;n<7;n++){const u=(p*2+n/7)%1;trioMessage(f.x-e.dir*(20+u*85),f.y-30+Math.sin(n*3)*20,20+10*(1-u),-e.dir*u,.6*(1-p)*(1-u),n%3);}return;}
 return trioFxV27(e,t);
};
const trioAuraV27=drawTrioAura;
drawTrioAura=function(f,t){trioAuraV27(f,t);const col=f.id===10?(f.formTier===2?'#ff315d':'#a6edff'):f.r.color;
 for(let n=0;n<8;n++){const u=(t*.8+n/8)%1,x=f.x+Math.sin(n*2.4+t*2)*(22+u*8),y=f.y-u*86;pixelStroke([[x,y+13],[x-3,y+5],[x+2,y-8]],f.id===10?2:1,col,(1-u)*.65);}
 if(f.id===8)trioSteak(f.x+Math.cos(t*3)*32,f.y-46+Math.sin(t*3)*17,19,t,.75);
 if(f.id===9)trioMessage(f.x+Math.cos(t*3)*32,f.y-46+Math.sin(t*3)*17,19,Math.sin(t)*.2,.75,Math.floor(t*3)%3);
};
const trioSpecialV27=drawTrioSpecial;
drawTrioSpecial=function(e,t){const f=fighters[e.owner],target=fighters[1-e.owner],p=e.age/e.duration;
 if(f.id===10){if(e.age<.58){for(let n=0;n<14;n++){const a=n*Math.PI/7+t*2,r=80*(1-e.age/.65);pixelStroke([[f.x+Math.cos(a)*r,f.y-40+Math.sin(a)*r*.7],[f.x,f.y-40]],1,'#9ceeff',.5);}return;}
 const u=Math.min(1,(e.age-.58)/1.3),x=f.x+(target.x-f.x)*u;drawTrioEnergy(10,x,target.y-37,180+u*100,200+u*80,e.age,Math.min(1,(e.duration-e.age)*5),f.face);for(let n=0;n<9;n++)pixelStroke([[x-f.face*(40+n*13),target.y-65+n*9],[x-f.face*(95+n*13),target.y-65+n*9]],2,'#ff647e',.6*(1-u));return;}
 const impact=Math.max(0,(e.age-.58)/1.57);for(let n=0;n<11;n++){const u=(impact*1.4+n*.091)%1,x=target.x+(n%5-2)*34+Math.sin(n*2)*15,y=target.y-220+u*220;if(e.age>.58)(f.id===8?trioSteak:trioMessage)(x,y,24+(n%3)*6,e.age*6+n,Math.min(1,impact*6, (1-p)*8),n%3);}
 if(e.age>.65)shockRing(target.x,424,impact*170,f.r.color,1-impact,.25);
};
const powerIconV27=powerIcon;
powerIcon=function(type,col){const art={
 redfist:'<path fill="#ffd59d" d="M5 10h4V6h13v3h5v13h-4v5H9v-3H5z"/><path fill="#af333e" d="M9 11h12v3h3v7h-4v3H11v-4H8v-6z"/><path stroke="#552337" stroke-width="2" d="m11 12 3 9m3-10 3 9"/>',
 redhook:'<path stroke="#e7d0a3" stroke-width="3" fill="none" d="M5 27 25 7M19 6l7 1-1 7"/><path fill="#ce4053" d="m11 15 5-5 7 7-5 5z"/>',
 stellar:'<path fill="#a44735" d="M5 15h22v7H5zM8 22h3v7H8zm13 0h3v7h-3z"/><path stroke="#ffe3a0" stroke-width="2" d="M7 16h18M10 12V7m6 5V3m6 9V6"/><path fill="#ff8a3d" d="m13 15 3-8 4 8z"/>',
 greenburst:'<path fill="#a2ffb2" d="M3 7h22v17H13l-6 5v-5H3z"/><path fill="#137653" d="M6 10h16v10H6z"/><path fill="#eaffd7" d="M8 13h3v3H8zm5 0h3v3h-3zm5 0h3v3h-3z"/>',
 greenrush:'<path fill="#aaffbd" d="m16 4 13 12-13 12v-7H8V11h8z"/><path fill="#33c181" d="M2 12h4v3H2zm-1 7h5v3H1z"/>',
 fortress:'<path fill="#a2ffb2" d="M9 3h14v3h3v22H6V6h3z"/><path fill="#176a54" d="M9 8h14v15H9z"/><path fill="#f2ffd9" d="M12 12h8v5h-3l-4 4v-4h-1zm2 14h5v1h-5z"/>',
 getsuga:'<path fill="#80e7ff" d="M20 2 9 7 3 16l6 10 11 4-7-8-2-6 3-7z"/><path fill="#f5ffff" d="m20 2-6 10-1 6 7 12-5-12 1-7z"/>',
 shunpo:'<path fill="#9cedff" d="m4 25 20-20 3 3L7 28z"/><path fill="#ffb36d" d="m20 6 5-4 5 5-4 5z"/><path stroke="#dfffff" stroke-width="2" d="M2 10h11M1 15h7M6 3h11"/>',
 bankai:'<path fill="#ff536e" d="m16 1 2 8 8 5-7 3 1 13-4-7-5 7 1-13-7-3 9-5z"/><path fill="#120f25" d="m16 4-2 14 2 5 2-5z"/><path fill="#fff5e3" d="M15 8h2v10h-2z"/>'};return art[type]?'<svg viewBox="0 0 32 32" shape-rendering="crispEdges" aria-hidden="true">'+art[type]+'</svg>':powerIconV27(type,col);};
// Existing catalog nodes were built before this module; refresh their icons in place.
function refreshTrioMiniIcons(){document.querySelectorAll('.character').forEach((node,id)=>{if(id<8||!roster[id])return;node.querySelectorAll('.mini-powers > span').forEach((el,i)=>{const skill=roster[id].skills[i];if(!skill)return;el.innerHTML=powerIcon(skill[6],roster[id].color)+'<i class="power-label">'+skill[1].split(' ')[0]+'</i>';});});}
refreshTrioMiniIcons();
const hitV27Trio=hit;hit=function(target,damage,source,force=1,handled=false){const landed=hitV27Trio(target,damage,source,force,handled);if(landed&&source.id>=8&&!specialScene){effect('trioBurst',target.x,target.y-36,trioColor(source),source.id===10?.28:.35,{id:source.id,size:force>1?110:62,dir:source.face});if(source.id<10&&force>1)effect('number',target.x,target.y-104,source.r.color,.65,{label:source.id===8?'NO PONTO!':'ENCAMINHADO!'});}return landed;};
