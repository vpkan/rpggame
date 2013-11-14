/**
 *
 * Author:
 *	zzw <oldj.wu@gmail.com>
 *
 * File: td-plot-buildings.js
 *
 * Create Date: 2010-11-12 14:16:47
 *
 */

// _TD.a.push begin
_TD.a.push(function (TD) {

	function lineTo2(ctx, x0, y0, x1, y1, len) {
		var x2, y2, a, b, p, xt,
			a2, b2, c2;

		if (x0 == x1) {
			x2 = x0;
			y2 = y1 > y0 ? y0 + len : y0 - len;
		} else if (y0 == y1) {
			y2 = y0;
			x2 = x1 > x0 ? x0 + len : x0 - len;
		} else {
			// 解一元二次方程
			a = (y0 - y1) / (x0 - x1);
			b = y0 - x0 * a;
			a2 = a * a + 1;
			b2 = 2 * (a * (b - y0) - x0);
			c2 = Math.pow(b - y0, 2) + x0 * x0 - Math.pow(len, 2);
			p = Math.pow(b2, 2) - 4 * a2 * c2;
			if (p < 0) {
//				TD.log("ERROR: [a, b, len] = [" + ([a, b, len]).join(", ") + "]");
				return [0, 0];
			}
			p = Math.sqrt(p);
			xt = (-b2 + p) / (2 * a2);
			if ((x1 - x0 > 0 && xt - x0 > 0) ||
				(x1 - x0 < 0 && xt - x0 < 0)) {
				x2 = xt;
				y2 = a * x2 + b;
			} else {
				x2 = (-b2 - p) / (2 * a2);
				y2 = a * x2 + b;
			}
		}

		ctx.lineCap = "round";
		ctx.moveTo(x0, y0);
		ctx.lineTo(x2, y2);

		return [x2, y2];
	}

	var renderFunctions = {
		"cannon": function (b, ctx, map, gs, gs2) {
			var target_position = b.getTargetPosition();

			ctx.setFillStyle ("#393");
			ctx.setStrokeStyle ( "#000");
			ctx.beginPath();
			ctx.setLineWidth ( 1);
			ctx.arc(b.cx, b.cy, gs2 - 5, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.setLineWidth ( 3);
			ctx.beginPath();
			ctx.moveTo(b.cx, b.cy);
			b.muzzle = lineTo2(ctx, b.cx, b.cy, target_position[0], target_position[1], gs2);
			ctx.closePath();
//			ctx.fill();
			ctx.stroke();

			ctx.setLineWidth ( 1);
			ctx.setFillStyle ("#060");
			ctx.beginPath();
			ctx.arc(b.cx, b.cy, 7, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.setFillStyle ("#cec");
			ctx.beginPath();
			ctx.arc(b.cx + 2, b.cy - 2, 3, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();

		},
		"LMG": function (b, ctx, map, gs, gs2) {
			var target_position = b.getTargetPosition();

			ctx.setFillStyle ( "#36f");
			ctx.setStrokeStyle ( "#000");
			ctx.beginPath();
			ctx.setLineWidth (1);
			ctx.arc(b.cx, b.cy, 7, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(b.cx, b.cy);
			b.muzzle = lineTo2(ctx, b.cx, b.cy, target_position[0], target_position[1], gs2);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.setLineWidth ( 1);
			ctx.setFillStyle ( "#66c");
			ctx.beginPath();
			ctx.arc(b.cx, b.cy, 5, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.setFillStyle ( "#ccf");
			ctx.beginPath();
			ctx.arc(b.cx + 1, b.cy - 1, 2, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();

		},
		"HMG": function (b, ctx, map, gs, gs2) {
			var target_position = b.getTargetPosition();

			ctx.setFillStyle ("#933");
			ctx.setStrokeStyle  ("#000");
			ctx.beginPath();
			ctx.setLineWidth ( 1);
			ctx.arc(b.cx, b.cy, gs2 - 2, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.setLineWidth ( 5);
			ctx.beginPath();
			ctx.moveTo(b.cx, b.cy);
			b.muzzle = lineTo2(ctx, b.cx, b.cy, target_position[0], target_position[1], gs2);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.setLineWidth (1);
			ctx.setFillStyle ( "#630");
			ctx.beginPath();
			ctx.arc(b.cx, b.cy, gs2 - 5, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.setFillStyle ( "#960");
			ctx.beginPath();
			ctx.arc(b.cx + 1, b.cy - 1, 8, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();

			ctx.setFillStyle ( "#fcc");
			ctx.beginPath();
			ctx.arc(b.cx + 3, b.cy - 3, 4, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();

		},
		"wall": function (b, ctx, map, gs, gs2) {
			ctx.setLineWidth (1);
			ctx.setFillStyle ("#666");
			ctx.setStrokeStyle ( "#000");
			ctx.fillRect(b.cx - gs2 + 1, b.cy - gs2 + 1, gs - 1, gs - 1);
			ctx.beginPath();
			ctx.moveTo(b.cx - gs2 + 0.5, b.cy - gs2 + 0.5);
			ctx.lineTo(b.cx - gs2 + 0.5, b.cy + gs2 + 0.5);
			ctx.lineTo(b.cx + gs2 + 0.5, b.cy + gs2 + 0.5);
			ctx.lineTo(b.cx + gs2 + 0.5, b.cy - gs2 + 0.5);
			ctx.lineTo(b.cx - gs2 + 0.5, b.cy - gs2 + 0.5);
			ctx.moveTo(b.cx - gs2 + 0.5, b.cy + gs2 + 0.5);
			ctx.lineTo(b.cx + gs2 + 0.5, b.cy - gs2 + 0.5);
			ctx.moveTo(b.cx - gs2 + 0.5, b.cy - gs2 + 0.5);
			ctx.lineTo(b.cx + gs2 + 0.5, b.cy + gs2 + 0.5);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		},
		"laser_gun": function (b, ctx/*, map, gs, gs2*/) {
//			var target_position = b.getTargetPosition();

			ctx.setFillStyle ( "#f00");
			ctx.setStrokeStyle ( "#000");
			ctx.beginPath();
			ctx.setLineWidth ( 1);
//			ctx.arc(b.cx, b.cy, gs2 - 5, 0, Math.PI * 2, true);
			ctx.moveTo(b.cx, b.cy - 10);
			ctx.lineTo(b.cx - 8.66, b.cy + 5);
			ctx.lineTo(b.cx + 8.66, b.cy + 5);
			ctx.lineTo(b.cx, b.cy - 10);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.setFillStyle ( "#60f");
			ctx.beginPath();
			ctx.arc(b.cx, b.cy, 7, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.setFillStyle ( "#000");
			ctx.beginPath();
			ctx.arc(b.cx, b.cy, 3, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();

			ctx.setFillStyle ( "#666");
			ctx.beginPath();
			ctx.arc(b.cx + 1, b.cy - 1, 1, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();

			ctx.setLineWidth ( 3);
			ctx.beginPath();
			ctx.moveTo(b.cx, b.cy);
//			b.muzzle = lineTo2(ctx, b.cx, b.cy, target_position[0], target_position[1], gs2);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		},"ice_gun": function (b, ctx/*, map, gs, gs2*/) {
			var gun_width=25;
//			var target_position = b.getTargetPosition();
			var flower_coeff=5;//0~10
			ctx.setFillStyle ( "#f00");
			ctx.setStrokeStyle ( "#000");
			ctx.beginPath();
			ctx.setLineWidth ( 1);
			
			ctx.moveTo(b.cx,b.y);//上
			ctx.lineTo(b.cx +5, b.cy -5);
			ctx.lineTo(b.x2, b.cy);//右
			ctx.lineTo(b.cx+5, b.cy+5);
			ctx.lineTo(b.cx, b.y2);//下
			ctx.lineTo(b.cx-5, b.cy+5);
			ctx.lineTo(b.x, b.cy);//左
			ctx.lineTo(b.cx-5, b.cy-5);
			ctx.lineTo(b.cx,b.y);
			ctx.setFillStyle ( "#f00");
			ctx.setStrokeStyle ( "#000");
			
//			ctx.arc(b.cx, b.cy, gs2 - 5, 0, Math.PI * 2, true);
			ctx.moveTo(b.cx, b.cy - 10);
			ctx.lineTo(b.cx - 8.66, b.cy + 5);
			ctx.lineTo(b.cx + 8.66, b.cy + 5);
			ctx.lineTo(b.cx, b.cy - 10);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.setFillStyle ("#60f");
			ctx.beginPath();
			ctx.arc(b.cx, b.cy, 7, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.setFillStyle ( "#000");
			ctx.beginPath();
			ctx.arc(b.cx, b.cy, 3, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();

			ctx.setFillStyle ( "#666");
			ctx.beginPath();
			ctx.arc(b.cx + 1, b.cy - 1, 1, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();

			ctx.setLineWidth ( 3);
			ctx.beginPath();
			ctx.moveTo(b.cx, b.cy);
//			b.muzzle = lineTo2(ctx, b.cx, b.cy, target_position[0], target_position[1], gs2);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}
	};

	TD.renderBuilding = function (building) {
		var ctx = TD.ctx,
			map = building.map,
			gs = TD.grid_size,
			gs2 = TD.grid_size / 2;

		(renderFunctions[building.type] || renderFunctions["wall"])(
			building, ctx, map, gs, gs2
			);
	}

}); // _TD.a.push end
