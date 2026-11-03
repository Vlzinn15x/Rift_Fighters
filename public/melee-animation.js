'use strict';
const smoothMelee=u=>{u=Math.max(0,Math.min(1,u));return u*u*(3-2*u)};
function meleeFrameSpec(f){const a=f.attackState,visualDelay=window.net?.active&&net.role==='guest'?Math.min(.1,Math.max(0,(Date.now()-(net.renderReceivedAt||Date.now()))/1000)):0,p=Math.max(0,Math.min(.999,(f.attackAge+visualDelay)/f.attackTotal)),contact=(a.impact||f.attackTotal*.36)/f.attackTotal,sheet=f.id<4?0:1,row=f.id<4?f.id:f.id-4;let move=sheet===0?[0,1,3,4][a.step]:a.step;if(sheet===0&&a.type==='air')move=2;const pose=p<contact*.68?0:p<contact+.15?1:2;return{sheet,row,frame:move*3+pose,pose,p,contact,rest:p>.92};}
function drawMeleeRest(f,height){if(typeof motionReady==='function'&&motionReady()){drawCleanMotionBody(f,height,0);return;}if(f.id>=5){drawGuestBody({...f,attackState:null,attack:0,moving:false,dash:0},time,height);return;}const frame=frames[0][f.id],scale=height/230,w=frame[2]*scale,h=frame[3]*scale,anchors=[.65,.57,.6,.62,.51];c.drawImage(atlas,...frame,-w*anchors[f.id],-h,w,h);}
function drawRichMelee(f,height){const spec=meleeFrameSpec(f),meta=meleeSheets[spec.sheet].rows[spec.row],image=spec.sheet?meleeArtB:meleeArtA;if(!image.complete||!image.naturalWidth){drawMeleeRest(f,height);return;}if(spec.rest){drawMeleeRest(f,height);return;}
 const frame=meta.frames[spec.frame],scale=height/meta.height,rect=frame.rect,anchor=frame.anchor;
 // Draw a complete, authored pose around its measured support-foot anchor.
 const air=f.attackState.type==='air'?Math.sin(spec.p*Math.PI)*7:0;
 c.drawImage(image,...rect,-anchor[0]*scale,-anchor[1]*scale-air,rect[2]*scale,rect[3]*scale);
}
function moveMeleeRoot(f){const a=f.attackState,p=f.attackAge/f.attackTotal;f.face=a.face??f.face;const max=a.advance??0,next=max*smoothMelee((p-.12)/.4),delta=next-(a.rootOffset||0);f.x=Math.max(35,Math.min(925,f.x+f.face*delta));a.rootOffset=next;}
// Optional training demonstration: four authored attacks, then a natural retreat.
let meleeDemoPause=0;
function toggleMeleeDemo(){window.signatureDemo=false;if(!window.training||mode!=='fight')return;if(window.comboDemo){window.comboDemo=false;return;}newRound();fighters[0].x=350;fighters[1].x=750;meleeDemoPause=0;window.comboDemo=true;}
function updateMeleeDemo(dt){const button=$('meleeDemo');button.classList.toggle('hidden',!window.training);button.textContent=window.comboDemo?'PARAR DEMO':'VER COMBO M1';if(!window.comboDemo||!window.training||mode!=='fight')return;const f=fighters[0];if(f.attackState||f.stun>0)return;if(meleeDemoPause>0){meleeDemoPause=Math.max(0,meleeDemoPause-dt);if(f.x>350){locomote(f,-1,180,dt);f.x=Math.max(350,f.x)};return;}const last=f.comboStep===3;if(queueAttack(f)&&last)meleeDemoPause=1.2;}
$('meleeDemo').onclick=toggleMeleeDemo;
