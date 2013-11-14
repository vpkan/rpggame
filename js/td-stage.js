/**
 *
 * Author:
 *	zzw <oldj.wu@gmail.com>
 *
 * File: td-stage.js
 *
 * Create Date: 2010-11-18 13:39:45
 *
 */


// _TD.a.push begin
_TD.a.push(function (TD) {

	/**
	 * 舞台类
	 * @param id {String} 舞台ID
	 * @param cfg {Object} 配置
	 */
	TD.Stage = function (id, cfg) {//stage-main
		this.id = id || ("stage-" + TD.lang.rndStr());//随机产生id
		this.cfg = cfg || {};
		this.width = this.cfg.width || 600;//如果没有配置那么默认是width
		this.height = this.cfg.height || 540;//如果没有配置那么默认值是540

		/**
		 * mode 有以下状态：
		 *		 "normal": 普通状态
		 *		 "build": 建造模式
		 */
		this.mode = "normal";

		/*
		 * state 有以下几种状态：
		 * 0: 等待中
		 * 1: 运行中
		 * 2: 暂停
		 * 3: 已结束
		 */
		this.state = 0;//当前的状态
		this.acts = [];//当前的动作
		this.current_act = null;//当前的动作
		this._step2 = TD.lang.nullFunc;//
		this._init();//init
	};

	TD.Stage.prototype = {//stage的原型
		_init: function () {//_init函数
			//console.log(this.cfg);//有height width init step2内部成员的对象
			if (typeof this.cfg.init == "function") {
				//TD.log("data-stage的_stage_main_init方法");
				this.cfg.init.call(this);
			}
			if (typeof this.cfg.step2 == "function") {
				//TD.log("data-stage的_stage_main_step2方法");
				this._step2 = this.cfg.step2;
			}
		},
		start: function () {//console.log(this.acts);//只有一个成员 current sence end_queue sences stage state 
			this.state = 1;
			//
			//这个act什么时候初始化的
			//TD.log("this.acts:");TD.log(this.acts);
			//TD.log("请问这里的acts 是什么时候初始化的");
			TD.lang.each(this.acts, function (obj) {//console.log(obj.start);console.log("123")
				obj.start();
			});
		},
		pause: function () {
			this.state = 2;
		},
		gameover: function () {
			//this.pause();
			this.current_act.gameover();
		},
		/**
		 * 清除本 stage 所有物品
		 */
		clear: function () {
			this.state = 3;
			TD.lang.each(this.acts, function (obj) {
				obj.clear();
			});
//		delete this;
		},
		/**
		 * 主循环函数
		 */
		step: function () {
			if (this.state != 1 || !this.current_act) return;
			TD.eventManager.step();//TD.eventManager是什么对象 响应鼠标的事件管理器
			this.current_act.step();

			this._step2();
		},
		/**
		 * 绘制函数
		 */
		render: function () {
			if (this.state == 0 || this.state == 3 || !this.current_act) return;
			//TD.log("stage的current_act.render()");
			this.current_act.render();
			
		},
		addAct: function (act) {//TD.log("stage.addAct");TD.log(act);
			this.acts.push(act);
		},
		addElement: function (el, step_level, render_level) {
			if (this.current_act)
				this.current_act.addElement(el, step_level, render_level);
		}
	};

}); // _TD.a.push end


// _TD.a.push begin
_TD.a.push(function (TD) {

	TD.Act = function (stage, id) {
		this.stage = stage;
		this.id = id || ("act-" + TD.lang.rndStr());

		/*
		 * state 有以下几种状态：
		 * 0: 等待中
		 * 1: 运行中
		 * 2: 暂停
		 * 3: 已结束
		 */
		this.state = 0;
		this.scenes = [];
		this.end_queue = []; // 本 act 结束后要执行的队列，添加时请保证里面全是函数
		this.current_scene = null;

		this._init();
	};

	TD.Act.prototype = {
		_init: function () {//TD.log("act init 往stage 里添加自身act");
			this.stage.addAct(this);
		},
		/*
		 * 开始当前 act
		 */
		start: function () {//TD.log("进入了act start方法");
			if (this.stage.current_act && this.stage.current_act.state != 3) {
				// queue...
				this.state = 0;
				this.stage.current_act.queue(this.start);
				return;
			}
			// start
			this.state = 1;
			this.stage.current_act = this;
			////这里总共才1个场景
			TD.lang.each(this.scenes, function (obj) {
				obj.start();//这个是绘制的总阀
			});
		},
		pause: function () {
			this.state = 2;
		},
		end: function () {
			this.state = 3;
			var f;
			while (f = this.end_queue.shift()) {
				f();
			}
			this.stage.current_act = null;
		},
		queue: function (f) {
			this.end_queue.push(f);
		},
		clear: function () {
			this.state = 3;
			TD.lang.each(this.scenes, function (obj) {
				obj.clear();
			});
//		delete this;
		},
		step: function () {
			if (this.state != 1 || !this.current_scene) return;
			this.current_scene.step();
		},
		render: function () {
			if (this.state == 0 || this.state == 3 || !this.current_scene) return;
			//TD.log("stage的current_act里的current_scene.render()");
			this.current_scene.render();
		},
		addScene: function (scene) {
			this.scenes.push(scene);
		},
		addElement: function (el, step_level, render_level) {
			if (this.current_scene)
				this.current_scene.addElement(el, step_level, render_level);
		},
		gameover: function () {
			//this.is_paused = true;
			//this.is_gameover = true;
			this.current_scene.gameover();
		}
	};

}); // _TD.a.push end


// _TD.a.push begin
_TD.a.push(function (TD) {

	TD.Scene = function (act, id) {
		this.act = act;
		this.stage = act.stage;
		this.is_gameover = false;
		this.id = id || ("scene-" + TD.lang.rndStr());
		/*
		 * state 有以下几种状态：
		 * 0: 等待中
		 * 1: 运行中
		 * 2: 暂停
		 * 3: 已结束
		 */
		this.state = 0;
		this.end_queue = []; // 本 scene 结束后要执行的队列，添加时请保证里面全是函数
		this._step_elements = [
			// step 共分为 3 层
			[],
			// 0
			[],
			// 1 默认
			[] // 2
		];
		this._render_elements = [ // 渲染共分为 10 层
			[], // 0 背景 1 背景图片
			[], // 1 背景 2
			[], // 2 背景 3 地图、格子
			[], // 3 地面 1 一般建筑
			[], // 4 地面 2 人物、NPC等 怎么把任务装入这个容器中 在grid的addMan中
			[], // 5 地面 3
			[], // 6 天空 1 子弹等
			[], // 7 天空 2 主地图外边的遮罩，panel
			[], // 8 天空 3
			[] // 9 系统特殊操作，如选中高亮，提示、文字遮盖等
		];

		this._init();
	};

	TD.Scene.prototype = {
		_init: function () {
			this.act.addScene(this);//一波怪物代表一个scene
			this.wave = 0; // 第几波
		},
		start: function () {
			if (this.act.current_scene &&
				this.act.current_scene != this &&
				this.act.current_scene.state != 3) {;
				// queue...
				this.state = 0;
				this.act.current_scene.queue(this.start);
				return;
			}
			
			// start
			this.state = 1;
			this.act.current_scene = this;
			
		},
		pause: function () {
			this.state = 2;
		},
		end: function () {
			this.state = 3;
			var f;
			while (f = this.end_queue.shift()) {
				f();
			}
			this.clear();
			this.act.current_scene = null;
		},
		/**
		 * 清空场景
		 */
		clear: function () {
			// 清空本 scene 中引用的所有对象以回收内存
			TD.lang.shift(this._step_elements, function (obj) {
				TD.lang.shift(obj, function (obj2) {
					// element
					//delete this.scene;
					obj2.del();
//				delete this;
				});
//			delete this;
			});
			TD.lang.shift(this._render_elements, function (obj) {
				
				TD.lang.shift(obj, function (obj2) {
					// element
					//delete this.scene;
					obj2.del();
//				delete this;
				});
//			delete this;
			});
//		delete this;
		},
		queue: function (f) {
			this.end_queue.push(f);
		},
		gameover: function () {
			if (this.is_gameover) return;
			this.pause();
			this.is_gameover = true;
		},
		step: function () {
			if (this.state != 1) return;
			if (TD.life <= 0) {
				TD.life = 0;
				this.gameover();
			}

			var i, a;
			for (i = 0; i < 3; i ++) {
				a = [];
				var level_elements = this._step_elements[i];
				TD.lang.shift(level_elements, function (obj) {
					if (obj.is_valid) {
						if (!obj.is_paused)
							obj.step();
						a.push(obj);
					} else {
						setTimeout(function () {
							obj = null;
						}, 500); // 一会儿之后将这个对象彻底删除以收回内存
					}
				});
				this._step_elements[i] = a;
			}
		},
		render: function () {//渲染 
//TD.log("主要的渲染方法 sence的render");
			
			if (this.state == 0 || this.state == 3) return;//如果是停止或者结束状态 不用渲染了
			var i, a,
				ctx = TD.ctx;
			//TD.log("清场");
			//alert(ctx.clearRect);
			ctx.clearRect(0, 0, this.stage.width, this.stage.height);//清除画布
			//TD.log("遍历this._render_elements");
		//TD.ctx.drawImage(TD.background_img,0,0);
			//var  canvas2 = document.getElementsByTagName("canvas")[0];//容易理解
			//var context_real= canvas2.getContext("2d");
			//var imagettt =new Image("1.jpg");
			//context_real.drawImage(imagettt,0,0);
			//alert(2);
			   /* var imgd_alpha = context_real.getImageData(0, 0, 32*18,  32*18); 
			     var pix_alpha = imgd_alpha.data;  
               for(var j = 3, n = pix_alpha.length; j < n; j += 4) {  
                    pix_alpha[j] = pix_alpha[j] * 0.5;  
                }  
                context_real.putImageData(imgd_alpha, 0, 0); */
			/*	var _canvas=document.getElementById("td-canvas");
		var _context=_canvas.getContext("2d");
		var _image=new Image();
		_image.src="img/1.jpg";*/
		//_context.drawImage(_image,0,0);
		//TD.ctx.drawImage(TD.image_box,0,0);
			for (i = 0; i < 10; i ++) {//遍历最多10次 依次从最底层开始渲染
				if(i==2){
					TD.angle=TD.tilt_angle;
					TD.radian=TD.tilt_radian;
					/*TD.ctx.translate(TD.grid_size*TD.width/2,TD.grid_size*TD.height/2);
					TD.ctx.rotate(Math.PI*(90-TD.angle)/180);
					TD.ctx.scale(TD.zoom, TD.zoom); //x坐标不缩放，y坐标变成2倍
					TD.ctx.translate(-TD.grid_size*TD.width/2,-TD.grid_size*TD.height/2);*/
				}else if(i==7){
					TD.angle=0;
				}
				a = [];
				//TD.log("每个_render_elements代表一个层");
				var level_elements = this._render_elements[i];//分了10层次
				TD.lang.shift(level_elements, function (obj) {//对每一个层次里的元素进行遍历
					if (obj.is_valid) {//有效的
						if (obj.is_visiable)//可见的
							obj.render();//渲染
						a.push(obj);//入栈
					}
				});
				this._render_elements[i] = a;//经过有效性筛选的
			}
			
			if (this.is_gameover) {
				this.panel.gameover_obj.show();//提示游戏结束
			}
		},
		addElement: function (el, step_level, render_level) {//将元素按照所属的层加入到统一资源里
			//TD.log([step_level, render_level]);
			//TD.log("current_sence addElement")
			step_level = step_level || el.step_level || 1;
			render_level = render_level || el.render_level;
			this._step_elements[step_level].push(el);//_step_elements
			this._render_elements[render_level].push(el);//_render_elements
			el.scene = this;
			el.step_level = step_level;
			el.render_level = render_level;
		}
	};

}); // _TD.a.push end
