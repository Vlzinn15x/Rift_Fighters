'use strict';
// Single-body poses only. VFX are always separate world events.
function motionReady(){return motionArtA.complete&&motionArtA.naturalWidth>0&&motionArtB.complete&&motionArtB.naturalWidth>0;}
function motionFrame(f){
 if(f.preview)return 0;
 if(f.stun>0||f.hitReact>.12)return 6;
 if(f.dash>0)return 3;
 if(f.attack>0&&f.kind==='cast')return f.attack>.24?6:f.attack>.07?7:6;
 if(f.y<421)return f.vy<0?3:6;
 if(f.guard||f.counter>0)return 6;
 if(f.moving){let i=Math.floor(f.walk/(Math.PI*2)*5)%5;if(f.moveDir*f.face<0)i=4-i;return i+1;}
 return 0;
}
function drawCleanMotionBody(f,height,frame=motionFrame(f)){if(f.id>=5&&f.moving&&!f.preview&&f.y===424&&f.attack<=0&&f.dash<=0&&gaitArt.complete&&gaitArt.naturalWidth){drawGroundedGait(f,height);return;}
 const sheet=f.id<4?0:1,row=f.id%4,meta=motionSheets[sheet].rows[row],cell=meta.frames[frame],image=sheet?motionArtB:motionArtA,scale=height/meta.height;
 c.drawImage(image,...cell.rect,-cell.anchor[0]*scale,-cell.anchor[1]*scale,cell.rect[2]*scale,cell.rect[3]*scale);
}
function drawMotionFighter(f,t,alpha,height){
 c.save();c.globalAlpha=Math.min(1,Math.max(0,alpha));
 if(!f.preview&&alpha===1){c.fillStyle='#02061780';c.beginPath();c.ellipse(f.x,427,23,4,0,0,Math.PI*2);c.fill();}
 c.translate(Math.round(f.x),Math.round(f.y));c.scale(f.face,f.preview?1:renderRatio);
 if(!f.preview&&f.formTime>0&&f.formTier===2)c.filter='brightness(1.16)';if(!f.preview&&f.hitReact>.19)c.filter='brightness(1.6)';
 if(typeof drawSkillBody==='function'&&drawSkillBody(f,height)){}else if(typeof drawActiveForm==='function'&&drawActiveForm(f,height)){}else if(activeMelee(f)&&f.id===5){const p=f.attackAge/f.attackTotal;c.translate(-Math.sin(p*Math.PI)*2,0);drawCleanMotionBody(f,height,p<.24?6:p<.7?7:6);}else if(activeMelee(f))drawRichMelee(f,height);else drawCleanMotionBody(f,height);
 c.restore();
 if(!f.preview&&alpha===1&&(f.guard||f.counter>0))shockRing(f.x,f.y-37,32,f.r.color,.55,1.2);
}
