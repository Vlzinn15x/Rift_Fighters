'use strict';
document.body.classList.add('ui30');
const ambient30=document.createElement('canvas');ambient30.id='menuParticles';ambient30.setAttribute('aria-hidden','true');document.body.appendChild(ambient30);
const portal30=document.createElement('div');portal30.className='menu-portal';portal30.setAttribute('aria-hidden','true');document.querySelector('.home-stage').appendChild(portal30);
const plinth30=document.createElement('div');plinth30.className='menu-plinth';document.querySelector('.home-fighter').prepend(plinth30);
const homeSettings30=document.createElement('button');homeSettings30.className='menu-settings';homeSettings30.textContent='♫ SOM';homeSettings30.setAttribute('aria-label','Ativar ou desativar som');homeSettings30.onclick=()=>{$('sound').click();homeSettings30.textContent=muted?'♫ SOM OFF':'♫ SOM ON';};document.querySelector('.home-stage').appendChild(homeSettings30);
const menuSpecial30=document.createElement('div');menuSpecial30.className='menu-special';$('details').after(menuSpecial30);
function refreshMenu30(){
 const r=roster[selected],info=document.querySelector('.selected-info');info.querySelector('.combo-recipe')?.remove();const recipe=$('details').querySelector('.combo-recipe');if(recipe)info.appendChild(recipe);
 const special=combatSets[selected];menuSpecial30.innerHTML='<b>V · '+special.special+'</b><canvas width="640" height="150" data-preview="3" aria-hidden="true"></canvas>';
 $('details').querySelectorAll('.skill-info').forEach((card,i)=>{const cv=document.createElement('canvas');cv.width=320;cv.height=180;cv.dataset.preview=i;cv.setAttribute('aria-hidden','true');card.prepend(cv);card.title=r.skills[i][2];});
 $('stats').innerHTML='<span>♥ VIDA <b>'+r.hp+'</b><i style="--value:'+Math.min(100,r.hp/140*100)+'%"></i></span><span>➤ VELOCIDADE <b>'+r.speed+'</b><i style="--value:'+Math.min(100,r.speed/300*100)+'%"></i></span>';
 const canvas=$('featured');canvas.width=460;canvas.height=360;
 $('bio').textContent=r.bio.split('. ')[0]+'.';
 document.querySelector('.hero-note').textContent=r.name+' / '+r.role;
}
const selectBeforeMenu30=select;select=function(id){selectBeforeMenu30(id);refreshMenu30();};
const menuPortraits30=portraits;portraits=function(t){menuPortraits30(t);if(currentPage!=='characters')return;const saved=c;try{document.querySelectorAll('[data-preview]').forEach(cv=>{c=cv.getContext('2d');c.clearRect(0,0,cv.width,cv.height);c.imageSmoothingEnabled=false;const k=Number(cv.dataset.preview),phase=(t*.75+k*.22)%1,f=makeFighter(selected,k===3?105:90);f.preview=true;f.face=1;f.y=cv.height-15;f.skillAnim={index:Math.min(2,k),age:phase*.8,duration:.8};f.attack=.8;
 if(k===2&&selected===10){f.formTime=10;f.formTier=1;}if(k===3&&selected===10){f.formTime=10;f.formTier=2;}
 drawSprite(f,t,1,k===3?110:135);
 const x=k===3?400:230,y=k===3?75:90;
 if(selected>=8){if(k===2){drawTrioEnergy(selected,x,y,95,65,t,.65,1);}else{const row=selected===8?(k===3?1:0):selected===9?(k===3?3:2):k===3?5:4;stampTrioVfx29(row,Math.floor(t*12)%6,x,y,k===3?200:140,k===3?75:80,.9,1);}}else stampPower(selected,Math.min(k,2),x,y,k===3?180:125,k===3?90:90,.85,0,1);
 });}finally{c=saved;}};
let ambientLast30=0;
function paintAmbient30(ms){requestAnimationFrame(paintAmbient30);if(document.hidden||document.body.classList.contains('playing')||ms-ambientLast30<45)return;ambientLast30=ms;const d=Math.min(devicePixelRatio||1,2),w=innerWidth,h=innerHeight;if(ambient30.width!==Math.round(w*d)||ambient30.height!==Math.round(h*d)){ambient30.width=Math.round(w*d);ambient30.height=Math.round(h*d);}const ctx=ambient30.getContext('2d');ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,w,h);const t=ms/1000;for(let n=0;n<23;n++){const x=(n*173+t*(8+n%5))%(w+20)-10,y=(n*97+t*(11+n%7))%(h+20)-10;ctx.fillStyle=n%3?'#ff9ddc88':'#7af5ff99';ctx.fillRect(Math.round(x),Math.round(y),n%3?4:2,n%3?2:3);}}
requestAnimationFrame(paintAmbient30);
refreshMenu30();
function alignPlatform30(){const cv=$('featured'),visual=document.querySelector('.hero-visual'),platform=document.querySelector('.hero-platform');if(!cv||!visual||!platform)return;const box=cv.getBoundingClientRect(),host=visual.getBoundingClientRect();if(!box.height)return;const scale=Math.min(box.width/cv.width,box.height/cv.height),ground=box.top-host.top+(box.height-cv.height*scale)/2+310*scale;platform.style.bottom=Math.max(0,host.height-ground-9)+'px';}
new ResizeObserver(alignPlatform30).observe(document.querySelector('.hero-visual'));
window.addEventListener('resize',alignPlatform30);alignPlatform30();

$('play').innerHTML='ENTRAR NA ARENA <span>↗</span>';
