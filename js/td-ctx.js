/**
 *
*
* Author:
*	zzw <zzw1986@gmail.com>
*	
*
* File: td0-ctx.js
* Create Date: 2013-9-23 8:29
*
*
*/

// _TD.a.push begin

_TD.a.push(function (TD) {
	
	/**
	 * ctx 是游戏中伪造的ctx
	 */
	TD.ctx_fake = function (canvas) {
		this.ctx_real = canvas.getContext("2d");//得到2d场景
		this.strokeStyle = null;
		this.lineWidth = null;
		this.fillStyle =null;
			this.textAlign = "left";
			this.textBaseline = "top";
			this.fillStyle = "#000";
			this.font = "normal 12px 'Courier New'";
		TD.ctx=this;
		return this;
	};

	TD.ctx_fake.prototype = {
		beginPath: function () {
			/*if(this.strokeStyle!=null)this.ctx_real.strokeStyle = this.strokeStyle;
				if(this.lineWidth!=null)this.ctx_real.lineWidth = this.lineWidth;
			if(this.fillStyle!=null)this.ctx_real.fillStyle =this.fillStyle ;
			*/this.ctx_real.beginPath();
		},
		
		clear:function(){
			this.ctx_real.strokeStyle = this.strokeStyle = null;
			this.ctx_real.lineWidth =this.lineWidth = null;
			this.ctx_real.fillStyle =this.fillStyle =null;
		},
		drawImage:function (img,sx,sy,width,height) {
			var result = [];
			result = TD.T(sx, sy);
			result[0]=result[0]-width/2;
			result[1]=result[1]-height+TD.grid_size/2;
			this.ctx_real.drawImage(img, result[0], result[1]);
		},
		drawImageOri:function (img,sx,sy) {
			this.ctx_real.drawImage(img, sx, sy);
		},
		setGlobalAlpha:function(val){
			//this.ctx_real.globalCompositeOperation="source-ove";
			this.ctx_real.globalAlpha=1;
		},
		arc: function (cx,cy,r,num,anchor,bool) {
			var p=TD.T(cx, cy);
			this.ctx_real.arc(p[0], p[1], r, 0, anchor, bool);
		},
		closePath: function () {
			this.ctx_real.closePath();
			//this.clear();
		},
		fill: function () {
			this.ctx_real.fill();
		},
		stroke:function () {
			this.ctx_real.stroke();
		},
		fillRect:function(cx, cy , width, height){
			//this.ctx_real.fillRect(cx, cy , width, height);
			var result = [];
			result = TD.T(cx, cy);
			this.ctx_real.moveTo(result[0], result[1]);
			result = TD.T(cx + width, cy);
			this.ctx_real.lineTo(result[0], result[1]);
			result = TD.T(cx + width, cy + height);
			this.ctx_real.lineTo(result[0], result[1]);
			result = TD.T(cx, cy + height);
			this.ctx_real.lineTo(result[0], result[1]);
			result = TD.T(cx, cy);
			this.ctx_real.lineTo(result[0], result[1]);
			//this.ctx_real.closePath();
			this.ctx_real.stroke();
			//this.ctx_real.fill();
		},
		lineTo:function(x,y){
			var p=TD.T(x, y);
			this.ctx_real.lineTo(p[0], p[1]);
		},
		clearRect:function(x, y, width, height){
			//var p=TD.T(x, y);
			//this.ctx_real.clearRect(p[0], p[1], width, height);
			this.ctx_real.clearRect(x, y, width, height);
		},
		strokeRect:function(cx, cy , width, height){
			//var p=TD.T(cx,cy);
			//strokeRect(this.ctx_real,cx, cy , width, height);
			var result = [];
			result = TD.T(cx, cy);
			this.ctx_real.moveTo(result[0], result[1]);
			result = TD.T(cx + width, cy);
			this.ctx_real.lineTo(result[0], result[1]);
			result = TD.T(cx + width, cy + height);
			this.ctx_real.lineTo(result[0], result[1]);
			result = TD.T(cx, cy + height);
			this.ctx_real.lineTo(result[0], result[1]);
			result = TD.T(cx, cy);
			this.ctx_real.lineTo(result[0], result[1]);
			//var p=TD.T(cx,cy);
			//this.ctx_real.clearRect(p[0], p[1], width, height);
		},
		moveTo:function(x, y){
			var p=TD.T(x,y);
			this.ctx_real.moveTo(p[0], p[1]);
		},
		fillText:function(text,x,y){
			var p=TD.T(x,y);
		/*	this.ctx_real.textAlign = "left";
			this.ctx_real.textBaseline = "top";
			this.ctx_real.fillStyle = "#000";
			this.ctx_real.font = "normal 12px 'Courier New'";*/
			this.ctx_real.fillText(text,p[0], p[1]);
		},
		rect:function(x,y,width,height){
			var p=TD.T(x,y);
			this.ctx_real.rect(p[0], p[1], width, height);
		},
		measureText:function(txt){
			return this.ctx_real.measureText(txt);
		},
		setStrokeStyle:function (val){
			this.ctx_real.strokeStyle =val; 
		},setLineWidth:function (val){
			this.ctx_real.lineWidth =val; 
		},setFillStyle:function(val){
			this.ctx_real.fillStyle =val;
		},setTextAlign:function(val){
			this.ctx_real.textAlign =val;
		},setTextBaseline:function(val){
			this.ctx_real.textBaseline =val;
		},setFont:function(val){
			this.ctx_real.font =val;
		}
		
	};
//alert(TD.ctx_fake);
}); // _TD.a.push end

