/**
 *
 * Author:
 *	zzw <oldj.wu@gmail.com>
 *
 * File: td-obj-map2.js
 *
 * Create Date: 2010-11-18 18:28:34
 *
 */


// _TD.a.push begin
_TD.a.push(function (TD) {
	// map 对象的属性、方法。注意属性中不要有数组、对象等
	// 引用属性，否则多个实例的相关属性会发生冲突
	var background_obj = {
		image:null,
		
		_init: function (cfg) {
			if(cfg.getBGImage() && cfg.getBGImage()[1]!=null && cfg.getBGImage()[1]!='')
			{
				this.image=new Image();
				
				this.image.src=cfg.getBGImage()[1];
				
			}
		},


		step: function () {
			
		},

		render: function () {//TD.log("map.render");
			if(this.image!=null ){
				var ctx = TD.ctx;
				ctx.drawImage(this.image,0,0);
			}
		}
	};

	/**
	 * @param cfg <object> 配置对象
	 *		 至少需要包含以下项：
	 *		 {
	 *			 grid_x: 宽度（格子）,
	 *			 grid_y: 高度（格子）,
	 *			 scene: 属于哪个场景,
	 *		 }
	 */
	TD.BackGround = function (id, cfg) {
		
		var background = new TD.Element(id, cfg);
		TD.lang.mix(background, background_obj);//map 是接口 实现类是map_obj
		background._init(cfg);

		return background;
	};



}); // _TD.a.push end

