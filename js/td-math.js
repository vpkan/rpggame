/**
 *
 *
 * Author:
 *	zzw <oldj.wu@gmail.com>
 *
 * File: td-math.js
 *
 * Create Date: 2013-9-25 10:08
 *
 * 本文件定义了常用的运算公式
 */

// _TD.a.push begin
_TD.a.push(function (TD) {

	/**
	 * 默认的正坐标运算
	 * @param old_level {Number}
	 * @param old_value {Number}
	 * @return new_value {Number}
	 */
	TD.T=function (x,y){
		
		if (this.angle == 0) {
			return [x, y ];
		} else {
			x-=this.width_px_half;
			y-=this.height_px_half;
			return [
						(x-y)*Math.sin(this.tilt_radian)+this.width_px_half,
	                    (x+y)*Math.cos(this.tilt_radian)+this.height_px_half
	               ];
	     }
	}
	
	
	TD.RT=function  (x,y){
		if (this.tilt_angle == 0) {
			return [x, y ];
		} else {
            x-=this.width_px_half;
			y-=this.height_px_half;
                return [
                   ((y / (2 * Math.cos(this.tilt_radian)) + x / (2 * Math.sin(this.tilt_radian))) +this.width_px_half),
                    ((y / (2 * Math.cos(this.tilt_radian)) - x / (2 * Math.sin(this.tilt_radian)))+this.height_px_half)
               ];
		}
	}

	
}); // _TD.a.push end
