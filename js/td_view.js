/**
 *
*
* Author:
*	zzw <zzw1986@gmail.com>
*	
*
* File: td_view.js
* Create Date: 2013-9-23 8:29
*
*
*/
var pi=Math.PI;
var angle=60;
var grid_size=32;
function Point(x,y){
	this.X=x;
	this.Y=y;
	return this;
}
function GetRadian(angle){
	return angle/180*Math.PI;
}
/*function RT(angle,p,grid_size){
  			if (angle == 0) {
                return new Point((int)(x/ gridSize), (int)(y / grid_size));
            } else {
                var radian = GetRadian(angle);
                return new Point(
                   ((p.Y / (2 * Math.cos(radian)) + p.X / (2 * Math.sin(radian))) / grid_size),
                    ((p.Y / (2 * Math.cos(radian)) - p.X / (2 * Math.sin(radian))) / grid_size)
                );
            }
}*/
/*function RT(x,y){
  			if (angle == 0) {
                return new Point((int)(x, (int)(y / grid_size));
            } else {
                var radian = GetRadian(angle);
                return new Point(
                   ((y / (2 * Math.cos(radian)) + x / (2 * Math.sin(radian))) ),
                    ((y / (2 * Math.cos(radian)) - x / (2 * Math.sin(radian))))
                );
            }
}*/
function RT(x,y){x-=256;y-=256;
angle=60;
	if (angle == 0) {
                return [(x), (y )];
            } else {
                var radian = GetRadian(angle);
               
                return [
                   ((y / (2 * Math.cos(radian)) + x / (2 * Math.sin(radian))) +256),
                    ((y / (2 * Math.cos(radian)) - x / (2 * Math.sin(radian)))+256)
               ];
            }
}
function T(x,y){x-=256;y-=256;

	if (angle == 0) {
                return [(x)+256, (y )+256];
            } else {
                var radian = GetRadian(angle);
                
                return [
                   (x-y)*Math.sin(radian)+256,
                    (x+y)*Math.cos(radian)+256
               ];
            }
}
function fillRect(ctx, x, y, width, height) {
	var result = [];
	result = T(x, y);
	ctx.moveTo(result[0], result[1]);
	result = T(x + width, y);
	ctx.lineTo(result[0], result[1]);
	result = T(x + width, y + height);
	ctx.lineTo(result[0], result[1]);
	result = T(x, y + height);
	ctx.lineTo(result[0], result[1]);
	result = T(x, y);
	ctx.lineTo(result[0], result[1]);
	//ctx.fill();
	//ctx.closePath();
	//
}

function strokeRect(ctx, x, y, width, height) {
	var result = [];
	result = T(x, y);
	ctx.moveTo(result[0], result[1]);
	result = T(x + width, y);
	ctx.lineTo(result[0], result[1]);
	result = T(x + width, y + height);
	ctx.lineTo(result[0], result[1]);
	result = T(x, y + height);
	ctx.lineTo(result[0], result[1]);
	result = T(x, y);
	ctx.lineTo(result[0], result[1]);
	//ctx.closePath();
	//
}