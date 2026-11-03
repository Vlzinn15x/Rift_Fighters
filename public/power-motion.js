'use strict';
let powerEventAge=null;
// Articulated raster bands + independently animated elemental shapes, never just a static stamp.
function sequenceIndex(clock,fps=12,loop=true){const frame=Math.max(0,Math.floor(clock*fps));return loop?frame%8:Math.min(7,frame)}
function drawSequenceArt(id,x,y,w,h,clock,alpha=1,flip=1,loop=true){if(!powerFrames.complete||!powerFrames.naturalWidth)return;const frame=sequenceIndex(clock,12,loop),rows=[0,200,410,605,795,992],sx=frame*powerFrames.naturalWidth/8,sy=rows[id]*powerFrames.naturalHeight/992,sh=(rows[id+1]-rows[id])*powerFrames.naturalHeight/992;c.save();c.translate(x,y);c.scale(flip,1);c.globalAlpha*=Math.max(0,alpha);c.drawImage(powerFrames,sx,sy,powerFrames.naturalWidth/8,sh,-w/2,-h/2,w,h);c.restore();}
function drawAnimatedTexture(img,sx,sy,sw,sh,w,h,id,index,special,t){
 if(index===2||special){const clock=special&&specialScene?Math.max(0,specialScene.age-.35):powerEventAge??t;drawSequenceArt(id,0,0,w,h,clock,1,1,id!==4||powerEventAge===null&&!special);}
 else c.drawImage(img,sx,sy,sw,sh,-w/2,-h/2,w,h);
}
function drawAnimatedProjectile(s,t){if(s.owner.id>=8){drawTrioShot(s,t);return;}if(s.owner.id>=5){drawGuestProjectile(s,t);return;}const id=s.owner.id,col=s.type==='poison'?'#a4f379':s.owner.r.color,phase=Math.floor(t*24)/24,bird=s.type==='phoenix',born=Math.min(1,(s.age??.15)/.1),w=bird?175:s.type==='bolt'?108:s.type==='ice'?100:68;
 c.save();c.translate(s.x,s.y);c.scale(s.dir,renderRatio);c.globalAlpha*=born;glow(0,0,w*.6,col,.22);const tail=-50;
 if(s.type==='fire'){
  // Every flame tongue travels backwards, grows, splits and vanishes on its own cycle.
  for(let j=0;j<14;j++){const u=(phase*(1.6+j%3*.2)+j*.147)%1,x=-u*85,y=Math.sin(j*2.4+phase*9)*u*23,size=(1-u)*(8+j%4*3);rect(x,y,size*2,size,j%3?'#ff6d28':'#ffdb6b');rect(x+size*.25,y+size*.1,size*.8,size*.45,'#fff1ae');}
  const r=15+Math.sin(phase*18)*3;hitStar(0,0,r*1.4,'#ff813a',phase,.9);hitStar(3,0,r*.75,'#fff4b5',-phase,.95);shard(7,0,16,Math.PI/2,'#fff5b6');
 }else if(s.type==='bolt'){
  for(let j=0;j<3;j++)lightning(-75,-12+j*12,20,Math.sin(phase*18+j)*13,col,phase*32+j,2);pixelStroke([[-50,0],[8,-4],[28,0],[9,4],[-50,0]],4,'#ebffff');for(let j=0;j<8;j++){const u=(phase*3+j*.17)%1;rect(-u*100,Math.sin(j*8+phase*20)*18*u,3,3,col);}
 }else if(s.type==='ice'){
  shard(0,0,29,Math.PI/2,'#a7eaff');shard(-25,8,13,Math.PI/2,'#e5fcff');for(let j=0;j<6;j++){const u=(phase*1.6+j/6)%1;shard(-u*84,Math.sin(j*5+phase*8)*u*27,7*(1-u)+2,phase*4+j,'#bceeff',1-u);}pixelStroke([[-17,-6],[15,0],[-17,6]],2,'#f2ffff');
 }else if(s.type==='poison'){
  for(let j=0;j<9;j++){const u=(phase*1.4+j*.18)%1,x=-u*70,y=Math.sin(phase*6+j*3)*u*22,sz=3+(1-u)*7;rect(x,y,sz,sz,j%2?'#a6ed5b':'#7c5fc2');}stampPower(3,1,0,Math.sin(phase*14)*3,65,65,.9,phase*.9);
 }else if(bird){stampPower(1,2,0,Math.sin(phase*8)*5,190,140,1,0);for(let j=0;j<12;j++){const u=(phase*1.2+j*.11)%1;shard(-35-u*100,Math.sin(j*4+phase*11)*u*45,8*(1-u)+4,phase+j,'#ffd376',1-u);}}
 c.restore();
}
function drawPowerMotion(e,t){if(e.wait>0||!e.owner)return;const k=Math.max(0,1-e.life/e.total),id=e.owner.id,col=roster[id].color,p=Math.floor(t*30)/30; c.save();
 if(e.type==='eruption'){
  for(let j=0;j<13;j++){const u=(p*(1.8+j%3*.2)+j*.217)%1,h=(1-u)*150*Math.sin(Math.min(1,k*4)*Math.PI*.5),x=e.x+Math.sin(j*5+p*5)*28,y=423-u*h;rect(x,y,7*(1-u)+2,18*(1-u)+3,j%2?'#ff9c36':'#ffed98');}
 }else if(e.type==='blizzard'){
  for(let j=0;j<14;j++){const a=p*3+j*.449,r=25+(j%5)*12,x=e.x+Math.cos(a)*r,y=360+Math.sin(a)*r*.5+(p*55+j*14)%65;shard(x,y,3+j%3,a,'#e8fcff',Math.min(1,k*6,(1-k)*5));}
 }else if(e.type==='storm'){
  const pulse=(p*9)%1;for(let j=0;j<4;j++)lightning(e.x+(j-1.5)*15,170+pulse*50,e.x+Math.sin(j+p*12)*16,423,col,p*27+j,1+j%2);shockRing(e.x,424,15+pulse*95,col,1-pulse,.14);
 }else if(e.type==='eclipse'){
  for(let j=0;j<10;j++){const a=p*4+j*.628,r=100*(1-k)+20;shard(e.x+Math.cos(a)*r,370+Math.sin(a)*r*.65,9+Math.sin(p*6+j)*3,a,col,Math.sin(k*Math.PI));}
 }else if(e.type==='quake'){
  for(let j=0;j<12;j++){const u=(k*1.4-j*.035),rise=Math.max(0,Math.sin(Math.min(1,Math.max(0,u))*Math.PI));if(rise>0){const x=e.x+(j-5.5)*60,y=424-rise*(25+j%3*12);rect(x,y,8+j%3*3,6+j%2*5,'#d5ae62');rect(x+1,y+1,3,2,'#fff0b0');}}
 }
 c.restore();
}

const drawFXBeforeSequences=drawFX;drawFX=function(e,t){powerEventAge=Math.max(0,e.total-e.life);try{return drawFXBeforeSequences(e,t)}finally{powerEventAge=null}};
