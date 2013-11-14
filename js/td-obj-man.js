/**
 *
 * Author:
 *	zzw <oldj.wu@gmail.com>
 *
 * File: td-obj-building.js
 *
 * Create Date: 2010-11-20 12:30:53
 *
 */


// _TD.a.push begin
_TD.a.push(function (TD) {

	// building 对象的属性、方法。注意属性中不要有数组、对象等
	// 引用属性，否则多个实例的相关属性会发生冲突
	var man_obj = {
		_init: function (cfg) {//这个cfg是什么东西 是不是td-data-stage-1.js
			this.destination=null;//目的地
			this.is_selected = false;
			this.level = 0;
			this.killed = 0; // 当前建筑杀死了多少怪物
			this.target = null;
			//需要优化 放到配置文件里
			this.im_photo=new Image();
			cfg = cfg || {};
			//alert(cfg);
			this.im_photo.src=cfg.image;//"img/npc1.gif";//
		
			
			this.map = cfg.map || null;
			this.grid = cfg.grid || null;

			/**
			 * 子弹类型，可以有以下类型：
			 *		 1：普通子弹
			 *		 2：激光类，发射后马上命中，暂未实现
			 *		 3：导弹类，击中后会爆炸，带来面攻击，暂未实现
			 */
			this.bullet_type = cfg.bullet_type || 1;

			/**
			 * type 可能的值有：
			 *		 "man": 战士
			 *
			 */
			this.type = cfg.type;

			this.speed = cfg.speed;
			this.bullet_speed = cfg.bullet_speed;
			this.is_pre_building = !!cfg.is_pre_building;//ZZW?这个是为什么
			this.blink = this.is_pre_building;
			this.wait_blink = this._default_wait_blink = 20;
			this.is_weapon = (this.type != "wall"); // 墙等不可攻击的建筑此项为 false ，其余武器此项为 true
			
			var o = TD.getDefaultManAttributes(this.type);
			TD.lang.mix(this, o);
			this.range_px = this.range * TD.grid_size;
			this.money = this.cost; // 购买、升级本建筑已花费的钱
			
			
			
			//copy from monster
			/*this.is_man = true;
			this.idx = cfg.idx || 1;
			this.difficulty = cfg.difficulty || 1.0;
			//var attr = TD.getDefaultMonsterAttributes(this.idx);

			this.speed = Math.floor(
				(attr.speed + this.difficulty / 2) * (Math.random() * 0.5 + 0.75)
			);
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
			this.render = attr.render;*/

			this.grid = null; // 当前格子
			this.map = cfg.map||null;
			this.next_grid = null;
			this.way = [];
			this.toward = 2; // 默认面朝下方
			this._dx = 0;
			this._dy = 0;

			this.is_blocked = false; // 前进的道路是否被阻塞了
			
			this.caculatePos();
		},

		/**
		 * 升级本建筑需要的花费
		 */
		getUpgradeCost: function () {
			return Math.floor(this.money * 0.75);
		},

		/**
		 * 出售本建筑能得到多少钱
		 */
		getSellMoney: function () {
			return Math.floor(this.money * 0.5) || 1;
		},

		/**
		 * 切换选中 / 未选中状态
		 */
		toggleSelected: function () {
			this.is_selected = !this.is_selected;
			this.grid.hightLight(this.is_selected); // 高亮
			var _this = this;

			if (this.is_selected) {
				// 如果当前建筑被选中
				//应该在onclick的时候就把上一个的select
				//this.map.selected_building.is_selected=false;
				this.map.eachBuilding(function (obj) {
					obj.is_selected = false;//牛气obj == _this 但是我觉得不必如此麻烦 只要找到当前map的select
				});//可支持多选
				this.map.eachMan(function (obj) {
					obj.is_selected = obj == _this;//牛气obj == _this 但是我觉得不必如此麻烦 只要找到当前map的select
				});
				// 取消另一个地图中选中建筑的选中状态
				(
					this.map.is_main_map ? this.scene.panel_map : this.scene.map
					).eachBuilding(function (obj) {
						obj.is_selected = false;
						obj.grid.hightLight(false);
				});
				this.map.selected_building = this;
			//TD.log("building toggleSelected 清空选择的building");
				if (!this.map.is_main_map) {
					// 在面版地图中选中了建筑，进入建筑模式
					this.scene.map.preMan(this.type);
				} else {
					// 取消建筑模式
					this.scene.map.cancelPreBuild();
				}

			} else {
				// 如果当前建筑切换为未选中状态

				if (this.map.selected_building == this){//TD.log("man toggleSelected 清空选择的building");
					this.map.selected_building = null;
				}
				if (!this.map.is_main_map) {
					// 取消建筑模式
					this.scene.map.cancelPreBuild();
				}
			}

			// 如果是选中 / 取消选中主地图上的建筑，显示 / 隐藏对应的操作按钮
			if (this.map.is_main_map) {
				if (this.map.selected_building) {
					this.scene.panel.btn_upgrade.show();
					this.scene.panel.btn_sell.show();
					this.updateBtnDesc();
				} else {
					this.scene.panel.btn_upgrade.hide();
					this.scene.panel.btn_sell.hide();
				}
			}
		},

		/**
		 * 生成、更新升级按钮的说明文字
		 */
		updateBtnDesc: function () {
			this.scene.panel.btn_upgrade.desc = TD._t(
				"upgrade", [
				TD._t("building_name_" + this.type),
				this.level + 1,
				this.getUpgradeCost()
			]);
			this.scene.panel.btn_sell.desc = TD._t(
				"sell", [
				TD._t("building_name_" + this.type),
				this.getSellMoney()
			]);
		},

		/**
		 * 将本建筑放置到一个格子中
		 * @param grid {Element} 指定格子
		 */
		locate: function (grid) {
			this.grid = grid;
			this.map = grid.map;
			this.cx = this.grid.cx;
			this.cy = this.grid.cy;
			this.x = this.grid.x;
			this.y = this.grid.y;
			this.x2 = this.grid.x2;
			this.y2 = this.grid.y2;
			this.width = this.grid.width;
			this.height = this.grid.height;

			this.px = this.x + 0.5;
			this.py = this.y + 0.5;

			this.wait_blink = this._default_wait_blink;
			this._fire_wait = Math.floor(Math.max(2 / (this.speed * TD.global_speed), 1));
			this._fire_wait2 = this._fire_wait;

		},

		/**
		 * 将本建筑彻底删除
		 */
		remove: function () {
//			TD.log("remove building #" + this.id + ".");
			if (this.grid && this.grid.building && this.grid.building == this)
				this.grid.building = null;
			this.hide();
			this.del();
		},

		/**
		 * 寻找一个目标（怪物）
		 */
		findTaget: function () {
			if (!this.is_weapon || this.is_pre_building || !this.grid) return;

			var cx = this.cx, cy = this.cy,
				range2 = Math.pow(this.range_px, 2);

			// 如果当前建筑有目标，并且目标还是有效的，并且目标仍在射程内
			if (this.target && this.target.is_valid &&
				Math.pow(this.target.cx - cx, 2) + Math.pow(this.target.cy - cy, 2) <= range2)
				return;

			// 在进入射程的怪物中寻找新的目标
			this.target = TD.lang.any(
				TD.lang.rndSort(this.map.monsters), // 将怪物随机排序
				function (obj) {
					return Math.pow(obj.cx - cx, 2) + Math.pow(obj.cy - cy, 2) <= range2;
			});
		},

		/**
		 * 取得目标的坐标（相对于地图左上角）
		 */
		getTargetPosition: function () {
			if (!this.target) {
				// 以 entrance 为目标
				var grid = this.map.is_main_map ? this.map.entrance : this.grid;
				return [grid.cx, grid.cy];
			}
			return [this.target.cx, this.target.cy];
		},

		/**
		 * 向自己的目标开火
		 */
		fire: function () {
			if (!this.target || !this.target.is_valid) return;

			if (this.type == "laser_gun"  ) {
				// 如果是激光枪，目标立刻被击中
				this.target.beHit(this, this.damage);
				return;
			}

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

		_upgrade2: function (k) {
			if (!this._upgrade_records[k])
				this._upgrade_records[k] = this[k];
			var v = this._upgrade_records[k],
				mk = "max_" + k,
				uk = "_upgrade_rule_" + k,
				uf = this[uk] || TD.default_upgrade_rule;
			if (!v || isNaN(v)) return;

			v = uf(this.level, v);
			if (this[mk] && !isNaN(this[mk]) && this[mk] < v)
				v = this[mk];
			this._upgrade_records[k] = v;
			this[k] = Math.floor(v);
		},

		/**
		 * 升级建筑
		 */
		upgrade: function () {
			if (!this._upgrade_records)
				this._upgrade_records = {};

			var attrs = [
				// 可升级的变量
				"damage", "range", "speed", "life", "shield"
			], i, l = attrs.length;
			for (i = 0; i < l; i ++)
				this._upgrade2(attrs[i]);
			this.level ++;
			this.range_px = this.range * TD.grid_size;
		},

		tryToUpgrade: function (btn) {
			var cost = this.getUpgradeCost(),
				msg = "";
			if (cost > TD.money) {
				msg = TD._t("not_enough_money", [cost]);
			} else {
				TD.money -= cost;
				this.money += cost;
				this.upgrade();
				msg = TD._t("upgrade_success", [
					TD._t("building_name_" + this.type), this.level,
					this.getUpgradeCost()
				]);
			}

			this.updateBtnDesc();
			this.scene.panel.balloontip.msg(msg, btn);
		},

		tryToSell: function () {
			if (!this.is_valid) return;

			TD.money += this.getSellMoney();
			this.grid.removeBuilding();
			this.is_valid = false;
			this.map.selected_building = null;
			this.map.select_hl.hide();
			this.map.checkHasWeapon();
			this.scene.panel.btn_upgrade.hide();
			this.scene.panel.btn_sell.hide();
			this.scene.panel.balloontip.hide();
		},
/**
		 * 取得要去的下一个格子
		 */
		getNextGrid: function () {
			if (this.way.length == 0 ||
				Math.random() < 0.1 // 有 1/10 的概率自动重新寻路
				) {
				this.findWay();
			}

			var next_grid = this.way.shift();
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
		step: function () {
			if(!this.map.is_main_map) return;
			if (this.blink) {//闪烁 表示还在拖曳中 未建造
				this.wait_blink --;
				if (this.wait_blink < -this._default_wait_blink)
					this.wait_blink = this._default_wait_blink;
			}
			
			this.findTaget();//试着去发现目标
			this.tryToFire();//试着去开火
			
			//如果是在panel里就不用执行以下代码
			
			if(!this.destination ) return;
			//TD.log("this.destination"+this.destination);
			if (!this.is_valid || this.is_paused || !this.grid) return;//是否 有效 停止 有grid
			
			if (!this.next_grid) {//如果没有next_grid的话就去取下一个grid
				this.getNextGrid();

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
			} else {
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
			//	alert("this.cx1:"+this.x+"this.cy1:"+this.y);
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
		//alert("this.cx2:"+this.x+"this.cy2:"+this.y);
		},
		/**
		 * 怪物前进的道路被阻塞（被建筑包围了）
		 */
		beBlocked: function () {
			if (this.is_blocked) return;

			this.is_blocked = true;
			TD.log("monster be blocked!");
		},
		caculatePos: function () {
//		if (!this.map) return;
			var r = this.r;
			this.x = this.cx - r;
			this.y = this.cy - r;
			this.x2 = this.cx + r;
			this.y2 = this.cy + r;
		},
		render: function () {//TD.log("building.render");
			if (!this.is_visiable || this.wait_blink < 0) return;

			
			var ctx =TD.ctx;
			
			ctx.setFillStyle ("#393");
			ctx.setStrokeStyle ( "#000");
			ctx.beginPath();
			ctx.setLineWidth ( 1);
			ctx.arc(this.cx, this.cy, 5, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			ctx.setGlobalAlpha(0.1);
			
			var im_photo=new Image();
			
			im_photo.src="img/npc1.gif";//
			ctx.drawImage(im_photo,this.cx, this.cy,104,85);
			ctx.setGlobalAlpha(1);
			if (
				this.map.is_main_map &&
				(
					this.is_selected || (this.is_pre_building) ||
					this.map.show_all_ranges
				) &&
				this.is_weapon && this.range > 0 && this.grid
				) {
				// 画射程
				ctx.setLineWidth ( 1);
				ctx.setFillStyle ( "rgba(187, 141, 32, 0.15)");
				ctx.setStrokeStyle ( "#bb8d20");
				ctx.beginPath();
				ctx.arc(this.cx, this.cy, this.range_px, 0, Math.PI * 2, true);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
			}

			/*if ((this.type == "laser_gun")  && this.target && this.target.is_valid) {
				// 画激光
				ctx.lineWidth = 3;
				ctx.strokeStyle = "rgba(50, 50, 200, 0.5)";
				ctx.beginPath();
				ctx.moveTo(this.cx, this.cy);
				ctx.lineTo(this.target.cx, this.target.cy);
				ctx.closePath();
				ctx.stroke();
				ctx.lineWidth = 1;
				ctx.strokeStyle = "rgba(150, 150, 255, 0.5)";
				ctx.beginPath();
				ctx.lineTo(this.cx, this.cy);
				ctx.closePath();
				ctx.stroke();
			}*/
			
		},

		onEnter: function () {//
			if (this.is_pre_building) return;
			
			var msg = "人物";
			if (this.map.is_main_map) {
				msg = TD._t("man_info" + (this.type == "man" ? "_man" : ""), 
					[TD._t("man_name_" + this.type), this.level, this.damage, this.speed, this.range, this.killed]);
			} else {
				msg = TD._t("man_intro_" + this.type, [TD.getDefaultManAttributes(this.type).cost]);
			}
			
			this.scene.panel.balloontip.msg(msg, this.grid);
		},

		onOut: function () {
			if (this.scene.panel.balloontip.el == this.grid) {
				this.scene.panel.balloontip.hide();
			}
		},

		onClick: function () {
			if (this.is_pre_building || this.scene.state != 1) return;
			//TD.log('man onclick');
			this.toggleSelected();
			this.map.selected_building=this;//selected_man
		
			
		},
		onRClick: function () {
						
		},
		/**
		 * 检查是否已到达终点
		 */
		checkFinish: function () {//如果到达了指定的目的地 会发生的事情。
			if (this.grid && this.map && this.grid == this.map.exit) {
				
			}
		},
		
		/**
		 * 移动
		 */
		moveTo: function ( mx,my) {//TD.log("moveTO");//如果到达了指定的目的地 会发生的事情。
			this.destination={"mx":mx,"my":my};
		},
		arrive: function () {
			this.grid.building=null;
			this.grid.build_flag=1;
			this.grid = this.next_grid;
			this.grid.building=this;
			this.grid.build_flag = 2;
			this.next_grid = null;
			
			this.checkFinish();
			//TD.log("x"+this.x+"y:"+this.y+"x2"+this.x2+"y2"+this.y2);
		},
		findWay: function () {
			var _this = this;
			//TD.log();
			var fw = new TD.FindWay(
				this.map.grid_x, this.map.grid_y,//x宽度 y高度 格子数
				this.grid.mx, this.grid.my,//当前所在的 x y
				this.destination.mx, this.destination.my,//目的地
				function (x, y) { //函数是否可以穿过
					return _this.map.checkPassable(x, y);
				}
				);
			this.way = fw.way;
			delete fw;
		}
		
		
	};

	/**
	 * @param cfg <object> 配置对象
	 *		 至少需要包含以下项：
	 *		 {
	 *			 type: 建筑类型，可选的值有
	 *				 "wall"
	 *				 "cannon"
	 *				 "LMG"
	 *				 "HMG"
	 *				 "laser_gun"
	 *				 "ice_gun"
	 *		 }
	 */
	TD.Man = function (id, cfg) {
		
		cfg.on_events = ["enter", "out", "click","rclick"];
		var man = new TD.Element(id, cfg);
		TD.lang.mix(man, man_obj);
		man._init(cfg);
		
		return man;
	};



}); // _TD.a.push end

