'use strict';
// Damage, recovery and reach are different for each fighter, not just their effects.
const combatSets=[
 {names:['Soco rápido','Cotovelo','Chute giratório','Chute da Fenda'],damage:[4,5,7,11],reach:[68,70,91,105],tempo:.92,special:'DRAGÃO RELÂMPAGO',line:'A tempestade termina aqui!'},
 {names:['Punho de brasa','Palma ardente','Chute solar','Explosão dupla'],damage:[5,6,7,12],reach:[66,76,86,110],tempo:1,special:'FÊNIX DA RUPTURA',line:'Das cinzas, eu renasço!'},
 {names:['Estocada','Varredura glacial','Corte ascendente','Lança polar'],damage:[4,5,7,11],reach:[94,103,91,118],tempo:1.08,special:'PRISÃO GLACIAL',line:'Seu próximo passo será o último.'},
 {names:['Corte veloz','Lâmina reversa','Giro sombrio','Execução da Fenda'],damage:[4,5,6,11],reach:[77,85,89,108],tempo:.85,special:'ECLIPSE SOMBRIO',line:'Minhas sombras já cercaram você.'},
 {names:['Punho de rocha','Ombrada','Gancho titânico','Ruptura terrestre'],damage:[6,7,9,14],reach:[72,79,84,120],tempo:1.25,special:'COLAPSO TITÂNICO',line:'A terra se curva diante de mim!'}
];
const combatFrames=[
 [[12,74,291,229],[306,48,257,252],[549,77,337,226],[866,79,260,226],[1108,69,282,235]],
 [[22,338,281,220],[326,306,227,249],[561,335,343,222],[877,330,251,226],[1117,336,278,219]],
 [[7,585,300,258],[330,568,246,269],[565,549,316,295],[855,566,270,279],[1131,545,265,300]],
 [[10,859,302,220],[310,850,252,229],[556,878,318,203],[862,888,285,194],[1119,867,273,213]]
];
function localFighter(){return fighters[window.net?.active&&net.role==='guest'?1:0]}
function queueAttack(f,variant){
 if(mode!=='fight'||specialScene||!f||f.stun>0||f.hp<=0||f.guard||f.dash>0)return false;
 if(f.melee>0||activeMelee(f)){if(!variant&&activeMelee(f))f.attackQueue=f.melee+.09;return false;}
 if(f.chainTimer<=0)f.comboStep=0;
 const set=combatSets[f.id],step=variant==='heavy'?3:f.comboStep%4;
 let type=variant|| (f.y<414?'air':f.dashLink>0?'dash':'combo');
 const tempo=set.tempo*(f.id>=8&&f.formTime>0?(f.id===10?(f.formTier===2?.74:.83):.9):1)*(f.id===5&&f.formTime>0?(f.formTier===2?.7:.78):f.id===6&&f.formTime>0&&f.formTier===2?.9:1),duration=(type==='heavy'?.62:type==='air'?.36:type==='dash'?.38:[.25,.29,.36,.5][step])*tempo;
 f.attackState={step,type,damage:type==='heavy'?set.damage[3]+4:type==='air'?8:type==='dash'?9:set.damage[step],range:type==='dash'?115:set.reach[step],impact:duration*(type==='heavy'?.43:.36),face:f.face,rootOffset:0,advance:(type==='dash'?38:type==='air'?9:type==='heavy'?26:[9,13,16,25][step])*(f.id===4?.8:1),ranged:f.id===5,label:type==='heavy'?'GOLPE CARREGADO':type==='air'?'ATAQUE AÉREO':type==='dash'?'GOLPE DE AVANÇO':set.names[step]};
 if(f.id===5)f.attackState.advance=0;if(f.id===6&&f.formTime>0)f.attackState.damage*=1.15;
 if(f.id>=8)tuneTrioAttack(f);f.skillAnim=null;f.attackAge=0;f.attackTotal=duration;f.attackHit=false;f.attack=duration;f.melee=duration;f.guard=false;f.moving=false;f.attackQueue=0;
 if(type==='combo'){f.comboStep=(step+1)%4;f.chainTimer=duration+.8;}else{f.comboStep=0;f.chainTimer=0;}
 if(type==='dash')f.dashLink=0;
 sound([360,260,190,105][step]*(f.id===4?.65:1),.07,'triangle');return true;
}
function basicAttack(f){if(window.net?.active&&net.role==='guest')return false;return queueAttack(f)}
function advanceAttack(f,dt){
 if(f.attackState){f.attackAge+=dt;const a=f.attackState;
 if(f.stun>0||f.dash>0){cancelMelee(f);return;}
 moveMeleeRoot(f);if(!f.attackHit&&f.attackAge>=a.impact){f.attackHit=true;const t=fighters[1-fighters.indexOf(f)],fin=a.step===3||a.type==='heavy';

 if(a.ranged)fireBloodM1(f,a);else {damageKnights(f,f.x,f.y-32,a.range,a.damage,true);
 effect(f.id>=8?'trioArc':'comboArc',f.x+f.face*32,f.y-40,f.r.color,Math.max(.016,Math.min(fin?.25:.16,f.attackTotal-f.attackAge)),{id:f.id,dir:f.face,step:a.step,fighterIndex:fighters.indexOf(f)});
 if(Math.abs(t.x-f.x)<a.range&&Math.abs(t.y-f.y)<(a.type==='air'?95:65)&&Math.sign(t.x-f.x)===f.face){
 const landed=hit(t,a.damage,f,fin?2:1,true);if(landed)registerStyleHit(f,t,a.step);if(landed&&fin){t.x=Math.max(35,Math.min(925,t.x+f.face*40));if(f.id===2||f.id===4){t.vy=-210;t.y-=2;}if(f.id===1)t.burn=Math.max(t.burn,1.5);if(f.id===2)t.slow=Math.max(t.slow,.7);if(f.id===3){ghosts.push({f:{...f},life:.22});}}
 }
 }
 }
 if(f.attackAge>=f.attackTotal){f.attackState=null;f.attack=0;f.melee=0;if(f.attackQueue>0){f.attackQueue=0;queueAttack(f);}}
 }
}
function chargeHeavy(f,held,dt){if(f.id===5){if(held&&f.melee<=0&&f.stun<=0)queueAttack(f);return;}if(!held){f.heavyHeld=0;f.heavyUsed=false;return}if(f.stun>0||f.guard)return;f.heavyHeld+=dt;if(f.heavyHeld>=.6&&!f.heavyUsed&&f.melee<=0){f.heavyUsed=!!queueAttack(f,'heavy');}}
function attackFrameAt(a,p){const wind=a.step===2||a.type==='air'?[0,4]:a.step===3||a.type==='heavy'?[0,6]:[0,1];const impact=a.type==='air'?5:[2,3,5,7][a.step];const frames=[wind[0],wind[1],impact,impact,wind[1],0];const edges=[.1,.24,.42,.64,.82,1];return frames[Math.min(5,edges.findIndex(edge=>p<edge)<0?5:edges.findIndex(edge=>p<edge))];}
function drawCombatPose(f,height){drawRichMelee(f,height)}
function requestSpecial(f){if(mode!=='fight'||specialScene||!f||f.rift<100||f.stun>0||f.dash>0||f.attack>0)return false;if(window.net?.active&&net.role==='guest'){net.actions.push(6);return true;}return launchSpecial(f)}
function launchSpecial(f){const i=fighters.indexOf(f),t=fighters[1-i];f.rift=0;cancelMelee(f);f.pendingSkill=-1;f.pendingTime=0;f.comboStep=0;clearInput();specialScene={owner:i,id:f.id,age:0,duration:2.15,striking:false,pulses:0,x:f.x,targetX:t.x,targetY:t.y};cinema=null;powerSound(f.id,2);sound(75,.6,'sawtooth');return true;}
function updateSpecial(dt){const e=specialScene;if(!e)return;e.age+=dt;clearInput();if(window.net)net.actions=[];const f=fighters[e.owner],t=fighters[1-e.owner];
 if(e.age<.58){f.face=f.x<t.x?1:-1;return;}
 const schedule=[.7,1.06,1.46];if(e.pulses<3&&e.age>=schedule[e.pulses]){const n=e.pulses++;e.striking=true;t.inv=0;hit(t,[7,8,18][n]+(f.id===4&&n===2?3:0),f,n===2?2.4:1);e.striking=false;t.stun=.12;t.inv=.1;hitStop=n===2?.035:.012;shake=n===2?13:5;flash=n===2?.1:0;burst(t.x,t.y-36,f.r.color,n===2?32:14);spectacle('explosion',t.x,t.y-38,f.id,.6,n===2?150:70);
 if(f.id===0){ghosts.push({f:{...f},life:.25});f.x=Math.max(55,Math.min(905,t.x-f.face*(n===1?-70:90)));}
 if(f.id===7)ghosts.push({f:{...f,x:t.x+(n%2?70:-70)},life:.5});if(f.id===5&&n===2)t.burn=3;if(f.id===6&&n===2)t.shield=0;if(f.id===3){ghosts.push({f:{...f,x:t.x+(n%2?70:-70)},life:.6});}
 }
 particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt});particles=particles.filter(p=>p.life>0);ghosts.forEach(g=>g.life-=dt);ghosts=ghosts.filter(g=>g.life>0);fx.forEach(x=>x.life-=dt);fx=fx.filter(x=>x.life>0);shake=Math.max(0,shake-dt*25);flash=Math.max(0,flash-dt);
 if(e.age>=e.duration){const id=f.id;if(id>=8)activateTrioForm(f,16,2);if(id===5||id===6)activateGuestForm(f,16,2);if(id===7){activateGuestForm(f,16,2);raiseKnights(f,5);}if(id===1)t.burn=2;if(id===2)t.slow=2;specialScene=null;f.attack=0;t.stun=.12;t.inv=.35;clearInput();if(fighters.some(x=>x.hp<=0))finish();}
}
function drawSpecialWorld(t){const e=specialScene;if(!e)return;const f=fighters[e.owner],target=fighters[1-e.owner],k=Math.max(0,(e.age-.5)/1.65),col=f.r.color;rect(0,0,960,540,'#02061c66');sigil(f.x,424,65+20*Math.sin(t*8),col,t*3,.7);glow(target.x,target.y-40,180,col,.35);
 if(f.id>=8){drawTrioSpecial(e,t);return;}if(f.id>=5){drawGuestSpecial(e,t);return;}if(e.age<.58){stampSpecial(f.id,f.x,f.y-65,155,170,.8);return;}
 const x=target.x,y=target.y-40;
 if(f.id===0){for(let j=0;j<4;j++)lightning(f.x-f.face*(60+j*12),f.y-30-j*12,x+Math.sin(t*15+j)*35,y+j*12,col,t*22+j,3);stampSpecial(0,x,y-30,265,255,.95,0,f.face);}
 if(f.id===1){stampSpecial(1,f.x+(x-f.x)*Math.min(1,k*1.7),y-40-Math.sin(k*Math.PI)*55,300,250,1,Math.sin(k*5)*.12,f.face);for(let j=0;j<3;j++)stampPower(1,1,x+(j-1)*65,424-60*Math.sin(k*Math.PI),120,170,Math.sin(k*Math.PI));}
 if(f.id===2){for(let j=0;j<6;j++){const a=j*Math.PI/3+k;stampPower(2,0,x+Math.cos(a)*85,y+Math.sin(a)*35,85,155,.9,a+Math.PI/2);}stampSpecial(2,x,y,260,260,Math.sin(k*Math.PI));}
 if(f.id===3){stampSpecial(3,x,y,310,300,.9,-k*2);for(let j=-1;j<=1;j+=2){const clone={...f,x:x+j*95,y:424,face:-j};drawSprite(clone,t,.65);lightning(clone.x,y,x,y,col,t*8+j,2);}}
 if(f.id===4){for(let j=-2;j<=2;j++){const rise=Math.max(0,Math.sin(Math.min(1,k*1.8-Math.abs(j)*.1)*Math.PI));stampPower(4,2,x+j*70,424-rise*65,145,210*rise,.95);}stampSpecial(4,x,350,300,270,Math.sin(k*Math.PI));shockRing(x,424,k*450,col,1-k,.2);}
}
function drawSpecialCinema(){const e=specialScene;if(!e)return;const set=combatSets[e.id],col=roster[e.id].color,a=Math.min(1,e.age*7,(e.duration-e.age)*5);c.save();c.globalAlpha=a;rect(0,0,960,45,'#030713');rect(0,458,960,82,'#030713');rect(0,458,960,2,col);text(roster[e.id].name+' / ESPECIAL DA FENDA',480,28,15,col,'center');text(set.special,480,487,25,'#fff','center');text(set.line,480,515,14,col,'center');c.restore();}
function drawRiftHud(){fighters.forEach((f,i)=>{const right=!!i,x=right?558:28,w=374,col=f.r.color;
 rect(x-3,17,w+6,85,'#030b1bd9');rect(x,17,w,2,col);text(f.r.name,right?929:31,34,16,col,right?'right':'left');text(Math.ceil(f.hp)+' / '+f.r.hp,right?558:401,33,10,'#d9edff',right?'left':'right');
 rect(x,41,w,18,'#17263c');rect(x+2,43,(w-4)*Math.max(0,f.hp/f.r.hp),14,col);rect(x+3,44,(w-6)*Math.max(0,f.hp/f.r.hp),3,'#ffffff77');
 const ready=f.rift>=100;for(let j=0;j<8;j++){const sx=x+j*47,fill=Math.max(0,Math.min(1,(f.rift-j*12.5)/12.5));c.strokeStyle=ready?'#efffff':col+'88';c.lineWidth=1;c.beginPath();c.moveTo(sx+5,65);c.lineTo(sx+39,65);c.lineTo(sx+44,71);c.lineTo(sx+39,77);c.lineTo(sx+5,77);c.lineTo(sx,71);c.closePath();c.fillStyle='#09152a';c.fill();c.stroke();if(fill>0){c.save();c.beginPath();c.rect(sx+2,66,41*fill,10);c.clip();rect(sx+3,67,39,8,ready?'#c9ffff':col);c.restore();}}
 text(ready?'ESPECIAL PRONTO  [V]':'ENERGIA DA FENDA  '+Math.floor(f.rift)+'%',right?929:31,91,9,ready?'#d7ffff':col,right?'right':'left');for(let j=0;j<2;j++)rect(right?920-j*13:31+j*13,108,8,4,j<wins[i]?'#b9ff65':'#45526c');
 rect(x,98,w*f.en/100,2,'#aaa2ff');
 });rect(439,15,82,76,'#081128ed');c.strokeStyle='#7694b9';c.strokeRect(439,15,82,76);text(window.training?'∞':Math.max(0,Math.ceil(clock)).toString().padStart(2,'0'),480,57,34,'#fff','center');text(window.training?'TREINO':'ROUND '+round,480,78,10,'#b8cbe4','center');
 const f=localFighter();if(f&&f.attackState){text(f.attackState.label.toUpperCase(),480,130,12,f.r.color,'center');for(let n=0;n<4;n++)rect(447+n*18,139,12,4,n<=f.attackState.step?f.r.color:'#35425b');}
}
function controlIcon(type,col){const glyph={fist:'<path d="M5 13H9V7H13V4H18V6H23V9H28V21H25V27H20V30H11V26H6V21H3V16H5Z"/><path fill="#fff3b6" d="M9 11H12V19H9ZM15 7H18V17H15ZM21 10H24V18H21Z"/>',dash:'<path d="M13 3H20V7H17V11H23V15H28V20H22V18H18V23H14V29H7V25H11V19H7V14H13V10H9V6H13Z"/><path opacity=".6" d="M1 11H7V14H1ZM0 19H6V22H0ZM2 27H6V29H2Z"/>',up:'<path d="M14 3H18V7H22V11H26V15H21V12H19V29H13V12H11V15H6V11H10V7H14Z"/>',left:'<path d="M5 14L17 3V10H29V22H17V29L5 18Z"/>',right:'<path d="M27 14L15 3V10H3V22H15V29L27 18Z"/>'};return '<svg viewBox="0 0 32 32" shape-rendering="crispEdges" fill="'+col+'" aria-hidden="true">'+(glyph[type]||glyph.fist)+'</svg>'}
function setControlArt(){document.querySelectorAll('.touch [data-key]').forEach(b=>{const k=b.dataset.key,type={m1:'fist',shift:'dash',w:'up',a:'left',d:'right'}[k];b.innerHTML=(k==='s'?powerIcon('shield','#b8c8eb'):controlIcon(type,k==='m1'?'#ffe39a':'#a7efff'))+'<small>'+({m1:'ATAQUE',shift:'DASH',w:'PULAR',a:'',d:'',s:'DEFESA'}[k]||'')+'</small>';});}
function refreshSpecialArt(){const f=localFighter();if(!f)return;const id=f.id;if($('specialButton').dataset.fighter!==String(id)){$('specialButton').dataset.fighter=id;$('specialButton').style.setProperty('--special',f.r.color);$('specialButton').innerHTML='<span class="special-art" style="'+(id>=8?trioIconStyle(id,6):id>=5?'background-image:url(assets/guest-powers-v15.png);background-size:800% 300%;background-position:42.857% '+((id-5)*50)+'%':'background-position:'+id*25+'% 50%')+'"></span>'+'<kbd>V</kbd><small>ESPECIAL</small><span class="special-fill"></span>';}document.querySelectorAll('[data-skill]').forEach((b,i)=>{const old=b.querySelector('.battle-power-art');if(old)old.outerHTML=powerIcon(f.r.skills[i][6],f.r.color);});}
function updateCombatButtons(){const f=localFighter();if(!f)return;refreshSpecialArt();const flying=f.id===6&&f.formTime>0;document.querySelectorAll('.touch [data-key]').forEach(el=>{const label=el.querySelector('small');if(label&&el.dataset.key==='w'){label.textContent=flying?'SUBIR':'PULAR';el.setAttribute('aria-label',flying?'Subir no voo':'Pular');}if(label&&el.dataset.key==='s'){label.textContent=flying?'DESCER':'DEFESA';el.setAttribute('aria-label',flying?'Descer no voo':'Defender');}});const b=$('specialButton'),ready=f.rift>=100&&!specialScene&&mode==='fight';b.disabled=!ready;b.classList.toggle('ready',ready);b.setAttribute('aria-label',combatSets[f.id].special+' — '+(ready?'pronto':Math.floor(f.rift)+' por cento'));b.querySelector('.special-fill').style.height=f.rift+'%';$('specialStatus').textContent=ready?'ESPECIAL PRONTO':Math.floor(f.rift)+'%';document.querySelectorAll('[data-skill]').forEach((el,i)=>{el.disabled=!!specialScene||mode!=='fight'||f.cd[i]>0||f.en<f.r.skills[i][4];});}
$('specialButton').onclick=()=>requestSpecial(localFighter());setControlArt();
function drawComboArc(e,t){drawElementTrail(e,t)}

const selectBeforeCombat=select;
select=function(id){selectBeforeCombat(id);const set=combatSets[id];$('stats').innerHTML+=`<span>◆ ESPECIAL [V]</span>`;$('bio').textContent=roster[id].bio+' M1: '+set.names.join(' → ')+'. Especial: '+set.special+'.';};

function stampSpecial(id,x,y,w,h,alpha=1,rotation=0,flip=1){if(id>=8){drawTrioEnergy(id,x,y,w,h,specialScene?.age||0,alpha,flip);return;}if(id>=5){stampGuestPower(id,x,y,w,h,Math.max(0,(specialScene?.age??0)-.35),alpha,rotation,flip,false);return;}if(!specialArt.complete||!specialArt.naturalWidth)return;const sw=specialArt.naturalWidth/5,sh=specialArt.naturalHeight;c.save();c.translate(x,y);c.rotate(rotation);c.scale(flip,1);c.globalAlpha*=Math.max(0,alpha);drawAnimatedTexture(specialArt,id*sw,0,sw,sh,w,h,id,2,true,time);c.restore();}
