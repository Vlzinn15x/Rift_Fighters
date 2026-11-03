'use strict';
function beginSkillAnimation(f,index,duration=.48){f.skillAnim={index,age:0,duration};f.attack=duration;f.melee=duration;}
function updateSkillAnimations(dt){for(const f of fighters){if(!f.skillAnim)continue;if(f.stun>0||f.dash>0){cancelMelee(f);continue;}f.skillAnim.age+=dt;if(f.skillAnim.age>=f.skillAnim.duration)f.skillAnim=null;}}
function skillProgress(f){const delay=window.net?.active&&net.role==='guest'?Math.min(.1,Math.max(0,(Date.now()-(net.renderReceivedAt||Date.now()))/1000)):0;return Math.min(.999,(f.skillAnim.age+delay)/f.skillAnim.duration);}
function flightFrame(f){return Math.floor((f.flightAge||0)*10)%8;}
function drawAirCell(row,frame,height){if(!airArt.complete||!airArt.naturalWidth)return false;const meta=airSheets[row],cell=meta.frames[frame],scale=height/meta.height;c.drawImage(airArt,...cell.rect,-cell.anchor[0]*scale,-cell.anchor[1]*scale,cell.rect[2]*scale,cell.rect[3]*scale);return true;}
function drawSkillBody(f,height){if(!f.skillAnim||f.preview)return false;const p=skillProgress(f),frame=Math.min(7,Math.floor(p*8));if(f.id===7&&drawAirCell(3,frame,height))return true;if(f.id===5&&f.formTime>0&&drawAirCell(2,frame,height))return true;if(f.id===6&&f.formTime>0&&drawAirCell(1,frame,height))return true;
 if(p<.08||p>.9){drawCleanMotionBody(f,height,0);return true;}
 const sheet=f.id<4?0:1,row=f.id%4,move=[0,1,0,1,3,3,3,2][f.id],meta=meleeSheets[sheet].rows[row],pose=p<.25?0:p<.57?1:2,cell=meta.frames[move*3+pose],img=sheet?meleeArtB:meleeArtA;
 if(!img.complete||!img.naturalWidth)return false;const scale=height/meta.height;c.drawImage(img,...cell.rect,-cell.anchor[0]*scale,-cell.anchor[1]*scale,cell.rect[2]*scale,cell.rect[3]*scale);return true;
}
