/**
 *
 * Author:
 *	zzw <oldj.wu@gmail.com>
 *
 * File: td-obj-monster.js
 *
 * Create Date: 2010-11-20 12:34:41
 *
 */


// _TD.a.push begin
_TD.a.push(function (TD) {

	// monster 对象的属性、方法。注意属性中不要有数组、对象等
	// 引用属性，否则多个实例的相关属性会发生冲突
	var monster_obj = {
		_init: function (cfg) {
			cfg = cfg || {};
			this.is_monster = true;
			this.idx = cfg.idx || 1;
			this.difficulty = cfg.difficulty || 1.0;
			var attr = TD.getDefaultMonsterAttributes(this.idx);
			this.is_selected=false;
			this.speed = Math.floor(
				(attr.speed + this.difficulty / 2) * (Math.random() * 0.5 + 0.75)
			);//随机初始化速度
			
			if (this.speed < 1) this.speed = 1;
			if (this.speed > cfg.max_speed) this.speed = cfg.max_speed;

			this.life = this.life0 = Math.floor(
				attr.life * (this.difficulty + 1) * (Math.random() + 0.5) * 0.5
			);
			if (this.life < 1) this.life = this.life0 = 1;

			this.shield = Math.floor(attr.shield + this.difficulty / 2);
			if (this.shield < 0) this.shield = 0;

			this.damage = Math.floor(
				(attr.damage || 1) * (Math.random() * 0.5 + 0.75)
			);
			if (this.damage < 1) this.damage = 1;

			this.money = attr.money || Math.floor(
				Math.sqrt((this.speed + this.life) * (this.shield + 1) * this.damage)
			);
			if (this.money < 1) this.money = 1;

			this.color = attr.color || TD.lang.rndRGB();
			this.r = Math.floor(this.damage * 1.2);
			if (this.r < 4) this.r = 4;
			if (this.r > TD.grid_size / 2 - 4) this.r = TD.grid_size / 2 - 4;
			this.render = attr.render;

			this.grid = null; // 当前格子
			this.map = null;
			this.next_grid = null;
			this.way = [];
			this.toward = 2; // 默认面朝下方
			this._dx = 0;
			this._dy = 0;
			//2013 10 add atr
			this.bullet_speed = cfg.bullet_speed;
			this.target=null;
			this.is_weapon = true;
			this.see_range=160;//视野
			this.range=60;//攻击范围
			this.is_blocked = false; // 前进的道路是否被阻塞了
		},
		caculatePos: function () {
//		if (!this.map) return;
			var r = this.r;
			this.x = this.cx - r;
			this.y = this.cy - r;
			this.x2 = this.cx + r;
			this.y2 = this.cy + r;
		},

		/**
		 * 怪物被击中
		 * @param building {Element} 对应的建筑（武器）
		 * @param damage {Number} 本次攻击的原始伤害值
		 */
		beHit: function (building, damage) {
			if (!this.is_valid) return;
			var min_damage = Math.ceil(damage * 0.1);
			damage -= this.shield;
			if (damage <= min_damage) damage = min_damage;

			this.life -= damage;
			TD.score += Math.floor(Math.sqrt(damage));
			if (this.life <= 0) {
				this.beKilled(building);
			}

			var balloontip = this.scene.panel.balloontip;
			if (balloontip.el == this) {
				balloontip.text = TD._t("monster_info", [this.life, this.shield, this.speed, this.damage]);
			}
			if(building.addtional){
				building.addtional(this);
			
			}
			
			
			
		},

		/**
		 * 怪物被杀死
		 * @param building {Element} 对应的建筑（武器）
		 */
		beKilled: function (building) {
			if (!this.is_valid) return;
			this.life = 0;
			this.is_valid = false;

			TD.money += this.money;
			building.killed ++;

			TD.Explode(this.id + "-explode", {
				cx: this.cx,
				cy: this.cy,
				color: this.color,
				r: this.r,
				step_level: this.step_level,
				render_level: this.render_level,
				scene: this.grid.scene
			});
		},
		arrive: function () {
			this.grid = this.next_grid;
			this.next_grid = null;
			this.checkFinish();
		},
		findWay: function () {//找到下一个目标
			var _this = this;
			var fw = new TD.FindWay(
				this.map.grid_x, this.map.grid_y,
				this.grid.mx, this.grid.my,
				this.target.mx, this.target.my,
				function (x, y) {
					return _this.map.checkPassable(x, y);
				}
				);
			this.way = fw.way;
			delete fw;
		},

		/**
		 * 检查是否已到达终点
		 */
		checkFinish: function () {
			if (this.grid && this.map && this.grid == this.map.exit) {
				TD.life -= this.damage;
				TD.wave_damage += this.damage;
				if (TD.life <= 0) {
					TD.life = 0;
					TD.stage.gameover();
				} else {
					this.pause();
					this.del();
				}
			}
		},
		beAddToGrid: function (grid) {
			this.grid = grid;
			this.map = grid.map;
			this.cx = grid.cx;
			this.cy = grid.cy;

			this.grid.scene.addElement(this);
		},

		/**
		 * 取得朝向
		 * 即下一个格子在当前格子的哪边
		 *	 0：上；1：右；2：下；3：左
		 */
		getToward: function () {
			if (!this.grid || !this.next_grid) return;
			if (this.grid.my < this.next_grid.my) {
				this.toward = 0;
			} else if (this.grid.mx < this.next_grid.mx) {
				this.toward = 1;
			} else if (this.grid.my > this.next_grid.my) {
				this.toward = 2;
			} else if (this.grid.mx > this.next_grid.mx) {
				this.toward = 3;
			}
		},

		/**
		 * 取得要去的下一个格子
		 */
		getNextGrid: function () {
			if(this.target==null ){
				//随便找个附近的格子让他去
				this.randomWalk();
				return;
			}
			
			//如果对象在攻击范围
			
			if (this.way.length == 0 ||
				Math.random() < 0.1 // 有 1/10 的概率自动重新寻路 来修正当前的道路
				) {
				
				this.findWay();//单纯寻路
			}

			var next_grid = this.way.shift();
			//为什么要放入两个参数
			if (next_grid && !this.map.checkPassable(next_grid[0], next_grid[1])) {
				this.findWay();
				next_grid = this.way.shift();
			}

			if (!next_grid) {
				return;
			}

			this.next_grid = this.map.getGrid(next_grid[0], next_grid[1]);
//			this.getToward(); // 在这个版本中暂时没有用
		},
		randomWalk:function(){
			var _index=Math.floor(Math.random()*4);
			var _grid=null;
			var _next_grid=null;
			//alert(_index);
			switch(_index){
				case 0:
				if(this.grid.mx>0){
					_next_grid=[this.grid.mx-1,this.grid.my];
					
					}
					break;
				case 1:
				if(this.grid.my>0){
					_next_grid=[this.grid.mx,this.grid.my-1];
					break;
					}
				case 2:
				if(this.grid.mx<this.map.grid_x-1){//alert("2的情况"+(this.grid.mx+1)+"y:"+this.grid.my);
					_next_grid=[this.grid.mx+1,this.grid.my];
					}
					break;
				case 3:
				if(this.grid.mx<this.map.grid_x-1){
					_next_grid=[this.grid.mx,this.grid.my+1];
					
					}
				break;	
			}
			//if(_next_grid){
			//alert(this.map.checkPassable(_next_grid[0], _next_grid[1]));
			//}
			
			if(_next_grid&& this.map.checkPassable(_next_grid[0], _next_grid[1])){
				//alert("_next_grid 不为空");
				this.next_grid = this.map.getGrid(_next_grid[0], _next_grid[1]);
			}
		},

		/**
		 * 检查假如在地图 (x, y) 的位置修建建筑，是否会阻塞当前怪物
		 * @param mx {Number} 地图的 x 坐标
		 * @param my {Number} 地图的 y 坐标
		 * @return {Boolean}
		 */
		chkIfBlocked: function (mx, my) {//实时检查是否怪物被困住了
			return false;
			var _this = this,
				fw = new TD.FindWay(
					this.map.grid_x, this.map.grid_y,
					this.grid.mx, this.grid.my,
					this.target.mx, this.target.my,
					function (x, y) {
						return !(x == mx && y == my) &&
							_this.map.checkPassable(x, y);
					}
				);

			return fw.is_blocked;

		},

		/**
		 * 怪物前进的道路被阻塞（被建筑包围了）
		 */
		beBlocked: function () {
			if (this.is_blocked) return;

			this.is_blocked = true;
			//TD.log("monster be blocked!");
		},

		step: function () {
			//alert("step monster range"+this.range);
			if (!this.is_valid || this.is_paused || !this.grid) return;//是否 有效 停止 有grid
			if (this.blink) {
				this.wait_blink --;
				if (this.wait_blink < -this._default_wait_blink)
					this.wait_blink = this._default_wait_blink;
			}

			this.findTaget();//试着去发现目标
			//if(this.target!=null)alert("fa xian mu biao");
			this.tryToFire();//试着去开火
			this.tryToWalk();

			
			//alert("this.cx2:"+this.x+"this.cy2:"+this.y);
		},
		
		tryToWalk:function (){
			
			
			
			if (!this.next_grid) {//如果没有next_grid的话就去取下一个grid
				this.getNextGrid();//在这里寻找可以攻击的目标

				/**
				 * 如果依旧找不着下一步可去的格子，说明当前怪物被阻塞了
				 */
				if (!this.next_grid) {
					this.beBlocked();
					return;
				}
			}

			if (this.cx == this.next_grid.cx && this.cy == this.next_grid.cy) {
				this.arrive();
			} else {//alert("在移动");
				// 移动到 next grid

				var dpx = this.next_grid.cx - this.cx,//移动的距离
					dpy = this.next_grid.cy - this.cy,
					sx = dpx < 0 ? -1 : 1,
					sy = dpy < 0 ? -1 : 1,
					speed = this.speed * TD.global_speed;
					
				
				//考虑减速时间
				if(this.slow_time&& this.slow_time>0)
				{
					this.slow_time--;
					if(this.slow_speed&& this.slow_speed>0)
						speed = (this.speed-this.slow_speed) * TD.global_speed;
				}else {
					this.slow_time=0;
				}
				//alert("this.cx1:"+this.x+"this.cy1:"+this.y);
				if (Math.abs(dpx) < speed && Math.abs(dpy) < speed) {
					this.cx = this.next_grid.cx;
					this.cy = this.next_grid.cy;
					this._dx = speed - Math.abs(dpx);
					this._dy = speed - Math.abs(dpy);
				} else {
					this.cx += dpx == 0 ? 0 : sx * (speed + this._dx);
					this.cy += dpy == 0 ? 0 : sy * (speed + this._dy);
					this._dx = 0;
					this._dy = 0;
				}
			}

			this.caculatePos();
		},
		onEnter: function () {
			var msg,
				balloontip = this.scene.panel.balloontip;

			if (balloontip.el == this) {
				balloontip.hide();
				balloontip.el = null;
			} else {
				msg = TD._t("monster_info",
					[this.life, this.shield, this.speed, this.damage]),
				balloontip.msg(msg, this);
			}
		},
		onRClick: function () {// alert("我是个怪物，我被点到了!");
// 			balloontip.msg(“我被选中了”, this);

			// var msg,
// 				balloontip = this.scene.panel.balloontip;
// 				balloontip.msg(“我被选中了”, this);
			this.is_selected=true;
			
		},
		onClick: function () {
			
			alert(this.is_selected);
			
		},
		onOut: function () {
//			if (this.scene.panel.balloontip.el == this) {
//				this.scene.panel.balloontip.hide();
//			}
		},
		/**
		 * 寻找一个目标（怪物）
		 */
		findTaget: function () {
			if (!this.is_weapon || this.is_pre_building || !this.grid) return;
			//alert("gongjifanwei:"+this.range)
			var cx = this.cx, cy = this.cy,
				range2 = Math.pow(this.see_range, 2);

			// 如果当前建筑有目标，并且目标还是有效的，并且目标仍在射程内
			if (this.target && this.target.is_valid &&
				Math.pow(this.target.cx - cx, 2) + Math.pow(this.target.cy - cy, 2) <= range2)
				return;

			// 在进入射程的怪物中寻找新的目标
			this.target = TD.lang.any(
				TD.lang.rndSort(this.map.mans), // 将怪物随机排序
				function (obj) {
					return Math.pow(obj.cx - cx, 2) + Math.pow(obj.cy - cy, 2) <= range2;
			});
			
			if(this.target)
			return;
			//alert(this.map.buildings.length);
			this.target = TD.lang.any(
				TD.lang.rndSort(this.map.buildings), // 将怪物随机排序
				function (obj) {
					return Math.pow(obj.cx - cx, 2) + Math.pow(obj.cy - cy, 2) <= range2;
			});
				//if(this.target)alert("zhao dao jian zu le ")
		},
		tryToFire: function () {
			if (!this.is_weapon || !this.target)
				return;

			this._fire_wait --;
			if (this._fire_wait > 0) {//大于零就重新继续等待发射
//			return;
			} else if (this._fire_wait < 0) {//如果小于零了就重新开始计时
				this._fire_wait = this._fire_wait2;
			} else {
				this.fire();//开火
			}
		},
		fire: function () {
			if (!this.target || !this.target.is_valid) return;

			if (true) {
				// 如果是激光枪，目标立刻被击中
				this.target.beHit(this, this.damage);
				return;
			}
			//ZZW TODO 需要设定当前怪物的方向
			var muzzle = this.muzzle || [this.cx, this.cy], // 炮口的位置
				cx = muzzle[0],
				cy = muzzle[1];

			new TD.Bullet(null, {
				building: this,
				damage: this.damage,
				target: this.target,
				speed: this.bullet_speed,
				additional:this.additional,
				x: cx,
				y: cy
			});
		}
	};

	/**
	 * @param cfg <object> 配置对象
	 *		 至少需要包含以下项：
	 *		 {
	 *			 life: 怪物的生命值
	 *			 shield: 怪物的防御值
	 *			 speed: 怪物的速度
	 *		 }
	 */
	TD.Monster = function (id, cfg) {
		cfg.on_events = ["enter", "out","click","rclick"];
		var monster = new TD.Element(id, cfg);
		//alert(cfg.see_range);
		TD.lang.mix(monster, monster_obj);
		monster._init(cfg);

		return monster;
	};


	/**
	 * 怪物死亡时的爆炸效果对象
	 */
	var explode_obj = {
		_init: function (cfg) {
			cfg = cfg || {};

			var rgb = TD.lang.rgb2Arr(cfg.color);
			this.cx = cfg.cx;
			this.cy = cfg.cy;
			this.r = cfg.r;
			this.step_level = cfg.step_level;
			this.render_level = cfg.render_level;

			this.rgb_r = rgb[0];
			this.rgb_g = rgb[1];
			this.rgb_b = rgb[2];
			this.rgb_a = 1;

			this.wait = this.wait0 = TD.exp_fps * (cfg.time || 1);

			cfg.scene.addElement(this);
		},
		step: function () {
			if (!this.is_valid) return;

			this.wait --;
			this.r ++;

			this.is_valid = this.wait > 0;
			this.rgb_a = this.wait / this.wait0;
		},
		render: function () {//TD.log("monster.render");
			var ctx = TD.ctx;

			ctx.setFillStyle ("rgba(" + this.rgb_r + "," + this.rgb_g + ","
				+ this.rgb_b + "," + this.rgb_a + ")");
			ctx.beginPath();
			ctx.arc(this.cx, this.cy, this.r, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();
		}
	};

	/**
	 * @param cfg {Object} 配置对象
	 *		 {
	 *			// 至少需要包含以下项：
	 * 			 cx: 中心 x 坐标
	 * 			 cy: 中心 y 坐标
	 * 			 r: 半径
	 * 			 color: RGB色彩，形如“#f98723”
	 * 			 scene: Scene 对象
	 * 			 step_level:
	 * 			 render_level:
	 *
	 * 			// 以下项可选：
	 * 			time: 持续时间，默认为 1，单位大致为秒（根据渲染情况而定，不是很精确）
	 *		 }
	 */
	TD.Explode = function (id, cfg) {
	//		cfg.on_events = ["enter", "out","rclick"];
		var explode = new TD.Element(id, cfg);
		TD.lang.mix(explode, explode_obj);
		explode._init(cfg);

		return explode;
	};

}); // _TD.a.push end


