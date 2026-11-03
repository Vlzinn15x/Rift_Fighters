'use strict';
// Separate whole-body atlases and timed effect atlases: no effect pixels in walk cycles.
function trioCell29(f){
 const form=f.id===10&&f.formTime>0?(f.formTier===2?4:3):0;
 const walking=f.moving&&!f.preview&&!specialScene&&!f.skillAnim&&!activeMelee(f)&&f.attack<=0&&f.dash<=0&&f.stun<=0&&f.y===424;
 if(form){if(walking)return{row:form,frame:1+(Math.floor(f.walk/Math.PI)%2+2)%2,walking:true};if(activeMelee(f)){const p=f.attackAge/f.attackTotal;return{row:form,frame:p<.25?0:p<.7?[3,3,4,5][f.attackState.step]:0};}if(f.skillAnim)return{row:form,frame:skillProgress(f)<.3?0:5};return{row:form,frame:0};}
 if(walking){let n=Math.floor(f.walk/(Math.PI*2)*6)%6;if(f.moveDir*f.face<0)n=5-n;return{row:0,frame:n,walking:true};}
 if(specialScene&&specialScene.owner===fighters.indexOf(f))return{row:2,frame:specialScene.age<.58?4:specialScene.age<1.6?1:5};
 if(f.skillAnim){const p=skillProgress(f),i=f.skillAnim.index;return{row:2,frame:i===2?(p<.75?4:5):i===1&&f.id===8?(p<.3?0:p<.75?3:5):p<.23?0:p<.5?1:p<.74?2:5};}
 if(activeMelee(f)){const p=f.attackAge/f.attackTotal;return{row:1,frame:p<.14?0:p<.31?1:p<.68?[2,3,4,5][f.attackState.step]:p<.83?[2,3,4,5][f.attackState.step]:0};}
 return{row:1,frame:f.dash>0?1:0};
}
const trioSpriteBefore29=drawTrioSprite;
drawTrioSprite=function(f,t,alpha,height){const image=trioBody29[f.id-8],meta=typeof trioAtlas29!=='undefined'&&trioAtlas29[f.id-8];if(!meta||!image.complete||!image.naturalWidth)return trioSpriteBefore29(f,t,alpha,height);
 let cell=trioCell29(f),row=meta.rows[cell.row],source=row.frames[cell.frame],art=image;if(cell.walking&&f.id===10&&f.formTime>0&&trioFormWalk29.complete&&trioFormWalk29.naturalWidth){row=trioFormWalkMeta29.rows[f.formTier===2?1:0];let frame=Math.floor(f.walk/(Math.PI*2)*6)%6;if(f.moveDir*f.face<0)frame=5-frame;source=row.frames[frame];art=trioFormWalk29;}
 c.save();c.globalAlpha=Math.max(0,Math.min(1,alpha));if(!f.preview&&alpha===1){c.fillStyle='#02061780';c.beginPath();c.ellipse(f.x,427,22,4,0,0,Math.PI*2);c.fill();}
 c.translate(Math.round(f.x),Math.round(f.y));c.scale(f.face,f.preview?1:renderRatio);
 if(!cell.walking){const pose=trioPoseMotion(f);c.translate(pose.x,pose.y);c.rotate(pose.rot);}
 if(f.hitReact>.19)c.filter='brightness(1.65)';
 drawGaitCell(art,row,source,height);c.restore();
 if(f.guard&&!f.preview)shockRing(f.x,f.y-36,31,f.r.color,.45,1.1);
};
function stampTrioVfx29(row,frame,x,y,width,height,alpha=1,dir=1){if(!trioVfx29.complete||!trioVfx29.naturalWidth)return false;const meta=trioFxAtlas29,cell=meta.rows[row].frames[Math.max(0,Math.min(5,frame))];c.save();c.translate(x,y);c.scale(dir,renderRatio);c.globalAlpha*=Math.max(0,alpha);c.drawImage(trioVfx29,...cell,-width/2,-height/2,width,height);c.restore();return true;}
const shotBefore29=drawTrioShot;
drawTrioShot=function(s,t){if(s.launchDelay>0)return;const id=s.owner.id;if(s.type==='redhook'){shotBefore29(s,t);trioSteak(s.x,s.y,23,(s.age||0)*6,.9);return;}
 const row=id===8?0:id===9?2:4,frame=Math.floor((s.age||0)*18)%6;
 c.save();if(id===10&&s.owner.formTime>0)c.filter='hue-rotate(165deg) saturate(1.6)';const drawn=stampTrioVfx29(row,frame,s.x,s.y,id===10?156:105,id===10?145:87,1,s.dir);c.restore();if(!drawn)return shotBefore29(s,t);
 if(id===10&&s.owner.formTime>0){c.save();c.globalCompositeOperation='screen';pixelStroke([[s.x-s.dir*65,s.y-13],[s.x,s.y],[s.x-s.dir*65,s.y+13]],3,'#ff315d',.85);c.restore();}
};
const fxBefore29=drawTrioEffect;
drawTrioEffect=function(e,t){if(e.wait>0)return;const p=Math.max(0,Math.min(.999,1-e.life/e.total));
 if(e.type==='trioBurst'){const row=e.id===8?1:e.id===9?3:5,size=Math.min(200,e.size||95);if(stampTrioVfx29(row,Math.floor(p*6),e.x,e.y,size*1.5,size*1.35,Math.min(1,(1-p)*4),e.dir||1)){shockRing(e.x,e.y,size*p*.7,e.col,(1-p)*.65,.5);return;}}
 if(e.type==='trioCharge'){const f=fighters.find(f=>f.id===e.id&&Math.abs(f.x-e.x)<60);if(f&&!f.skillAnim&&!specialScene)return;for(let n=0;n<12;n++){const a=n*Math.PI/6+p*4,r=(1-p)*48;shard(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r*.7,2+p*2,a,e.col,Math.sin(p*Math.PI));}return;}
 return fxBefore29(e,t);
};
const specialBefore29=drawTrioSpecial;
drawTrioSpecial=function(e,t){const f=fighters[e.owner],target=fighters[1-e.owner];specialBefore29(e,t);if(e.age<.58)return;
 const age=e.age-.58,p=Math.min(1,age/1.57),col=f.id===10?'#8eeaff':f.r.color;
 const pulse=(age%.37)/.37;
 stampTrioVfx29(f.id===8?1:f.id===9?3:5,Math.floor(pulse*6),target.x,target.y-35,210,190,(1-p)*.8,f.face);
 for(let j=0;j<9;j++){const y=180+j*26;pixelStroke([[target.x-f.face*(60+j*9),y],[target.x-f.face*(120+j*11),y]],1,col,Math.sin(p*Math.PI)*.35);}
 if(f.id===8||f.id===9){const row=f.id===8?0:2;for(let n=0;n<4;n++){const u=(age*.9+n*.25)%1;stampTrioVfx29(row,Math.floor(age*16+n)%6,target.x+(n-1.5)*44,205+u*190,80,75,Math.sin(p*Math.PI),f.face);}}
};
// Swap the catalog, previews and mobile ultimate art to the same character atlas.
trioIconStyle=function(id,frame=0){return 'background-image:url(assets/trio-'+id+'-v29.png);background-size:600% '+(id===10?500:300)+'%;background-position:'+((frame%6)*20)+'% '+(id===10?'100':'50')+'%';};
const galleryBefore29=updatePowerGallery;updatePowerGallery=function(id){galleryBefore29(id);if(id<8)return;document.querySelectorAll('.power-art').forEach((el,i)=>{el.style.backgroundImage='url(assets/trio-'+id+'-v29.png)';el.style.backgroundSize='600% '+(id===10?500:300)+'%';el.style.backgroundPosition=([1,3,4][i]*20)+'% '+(id===10?'50':'100')+'%';});};
const updateSkillBefore29=updateSkillAnimations;
updateSkillAnimations=function(dt){updateSkillBefore29(dt);for(const f of fighters){const blink=f.trioBlink;if(!blink)continue;if(f.stun>0||f.dash>0||!f.skillAnim||f.skillAnim.index!==1){f.trioBlink=null;continue;}blink.age+=dt;if(blink.age<.14)continue;const target=fighters[blink.target];f.trioBlink=null;if(!target||target.hp<=0)continue;
 const old={...f,moving:false,skillAnim:null,attackState:null};ghosts.push({f:old,life:.24});effect('trioPortal',f.x,f.y-35,f.r.color,.34,{id:10});f.x=Math.max(45,Math.min(915,target.x-target.face*62));f.face=target.face;f.inv=Math.max(f.inv,.18);effect('trioPortal',f.x,f.y-35,f.r.color,.34,{id:10});if(Math.abs(target.y-f.y)<80)hit(target,blink.damage,f,1.2);
}};
