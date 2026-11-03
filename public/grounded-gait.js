'use strict';
function groundedFrame(f){let frame=Math.floor(f.walk/(Math.PI*2)*8)%8;if(f.moveDir*f.face<0)frame=7-frame;return frame;}
// Lazy bounded cache: alpha masks are rasterized once rather than clipped every frame.
const gaitCache32=new Map();
function gaitRaster32(image,cell){
 let cached=gaitCache32.get(cell);if(cached&&cached.image===image){gaitCache32.delete(cell);gaitCache32.set(cell,cached);return cached.canvas;}
 if(!cell.mask)return null;
 const cv=document.createElement('canvas');cv.width=cell.rect[2];cv.height=cell.rect[3];const ctx=cv.getContext('2d');if(!ctx||typeof ctx.clip!=='function')return null;
 ctx.imageSmoothingEnabled=false;ctx.save();cell.clipPath??=new Path2D(cell.mask);ctx.clip(cell.clipPath);ctx.drawImage(image,...cell.rect,0,0,cv.width,cv.height);ctx.restore();
 gaitCache32.set(cell,{image,canvas:cv});while(gaitCache32.size>96){const first=gaitCache32.keys().next().value;gaitCache32.delete(first);}return cv;
}
function drawGaitCell(image,row,cell,height){const scale=height/row.height,raster=gaitRaster32(image,cell);c.save();c.translate(-cell.anchor[0]*scale,-cell.anchor[1]*scale);c.scale(scale,scale);if(raster)c.drawImage(raster,0,0);else{if(cell.mask){cell.clipPath??=new Path2D(cell.mask);c.clip(cell.clipPath);}c.drawImage(image,...cell.rect,0,0,cell.rect[2],cell.rect[3]);}c.restore();}
function drawGroundedGait(f,height){const row=gaitSheets[f.id-5];drawGaitCell(gaitArt,row,row.frames[groundedFrame(f)],height);}
function drawFormGait(f,height){if(!formGaitArt.complete||!formGaitArt.naturalWidth)return false;const row=formGaitSheets[f.id-5];drawGaitCell(formGaitArt,row,row.frames[groundedFrame(f)],height);return true;}
