/**
 *
 * Author:
 *	zzw <oldj.wu@gmail.com>
 *
 * File: td-obj-grid2.js
 *
 * Create Date: 2010-11-18 19:10:53
 *
 */


// _TD.a.push begin
_TD.a.push(function (TD) {

	// grid 对象的属性、方法。注意属性中不要有数组、对象等
	// 引用属性，否则多个实例的相关属性会发生冲突
	var grid_obj = {
		_init: function (cfg) {
			cfg = cfg || {};
			/*迷雾
			this.image_num=0;
			this.image_data=[0,0,0,0];*/
			this.map = cfg.map;
			this.scene = this.map.scene;
			this.mx = cfg.mx; // 在 map 中的格子坐标
			this.my = cfg.my;
			this.width = TD.grid_size;
			this.height = TD.grid_size;
			this.is_entrance = this.is_exit = false;
			this.passable_flag = 1; // 0: 不可通过; 1: 可通过
			this.build_flag = 1,// 0: 不可修建; 1: 可修建; 2: 已修建
			this.building = null;
			this.caculatePos();
		},
		/*addImageNum:function (num){
			this.image_num+=num;
		},*/
		/**
		 * 根据 map 位置及本 grid 的 (mx, my) ，计算格子的位置
		 */
		caculatePos: function () {
			this.x = this.map.x + this.mx * TD.grid_size;
			this.y = this.map.y + this.my * TD.grid_size;
			this.x2 = this.x + TD.grid_size;
			this.y2 = this.y + TD.grid_size;
			this.cx = Math.floor(this.x + TD.grid_size / 2);
			this.cy = Math.floor(this.y + TD.grid_size / 2);
		},

		/**
		 * 检查如果在当前格子建东西，是否会导致起点与终点被阻塞
		 */
		checkBlock: function () {
			if (this.is_entrance || this.is_exit) {
				this._block_msg = TD._t("entrance_or_exit_be_blocked");
				return true;
			}

			var is_blocked,
				_this = this,
				fw = new TD.FindWay(
					this.map.grid_x, this.map.grid_y,
					this.map.entrance.mx, this.map.entrance.my,
					this.map.exit.mx, this.map.exit.my,
					function (x, y) {
						return !(x == _this.mx && y == _this.my) && _this.map.checkPassable(x, y);
					}
				);

			is_blocked = fw.is_blocked;

			if (!is_blocked) {
				is_blocked = !!this.map.anyMonster(function (obj) {
					return obj.chkIfBlocked(_this.mx, _this.my);
				});
				if (is_blocked)
					this._block_msg = TD._t("monster_be_blocked");
			} else {
				this._block_msg = TD._t("blocked");
			}

			return is_blocked;
		},

		/**
		 * 购买建筑
		 * @param building_type {String}
		 */
		buyBuilding: function (building_type) {
			var cost = TD.getDefaultBuildingAttributes(building_type).cost || 0;
			if (TD.money >= cost) {
				TD.money -= cost;
				this.addBuilding(building_type);
			} else {
				//TD.log(TD._t("not_enough_money", [cost]));
				this.scene.panel.balloontip.msg(TD._t("not_enough_money", [cost]), this);
			}
		},
		
/**
		 * 购买建筑
		 * @param building_type {String}
		 */
		buyMan: function (man_type) {
			var cost = TD.getDefaultManAttributes(man_type).cost || 0;
			if (TD.money >= cost) {
				TD.money -= cost;
				this.addMan(man_type);
			} else {
				TD.log(TD._t("not_enough_money", [cost]));
				this.scene.panel.balloontip.msg(TD._t("not_enough_money", [cost]), this);
			}
		},

		/**
		 * 在当前格子添加指定类型的建筑
		 * @param building_type {String}
		 */
		addBuilding: function (building_type) {//ZZW?什么时候执行的addBuilding 在map的初始化里 map_obj ._init
			
			if (this.building) {
				// 如果当前格子已经有建筑，先将其移除
				this.removeBuilding();
			}

			var building = new TD.Building("building-" + building_type + "-" + TD.lang.rndStr(), {
				type: building_type,
				step_level: this.step_level,
				render_level: this.render_level
			});
			building.locate(this);

			this.scene.addElement(building, this.step_level, this.render_level + 1);
			this.map.buildings.push(building);
			this.building = building;
			this.build_flag = 2;
			this.map.checkHasWeapon();
			if (this.map.pre_building)
				this.map.pre_building.hide();
		},
		/**
		 * 在当前格子添加指定类型的建筑
		 * @param building_type {String}
		 */
		addMan: function (man_type) {//ZZW?什么时候执行的addBuilding 在map的初始化里 map_obj ._init
			
			if (this.building) {
				// 如果当前格子已经有建筑，先将其移除
				this.removeBuilding();
			}

			var man = new TD.Man("man-" + man_type + "-" + TD.lang.rndStr(), {
				type: man_type,
				step_level: this.step_level,
				render_level: this.render_level//什么时候用到这个render_level
			});
			man.locate(this);
			this.scene.addElement(man, this.step_level, (this.render_level<4?4:this.render_level) + 1);
			this.map.mans.push(man);
			this.man = man;
			//this.building = man;
			this.build_flag = 2;
			this.map.checkHasWeapon();
			if (this.map.pre_building)
				this.map.pre_building.hide();
		},
		/**
		 * 移除当前格子的建筑
		 */
		removeBuilding: function () {
			if (this.build_flag == 2)
				this.build_flag = 1;
			if (this.building)
				this.building.remove();
			this.building = null;
		},

		/**
		 * 在当前建筑添加一个怪物
		 * @param monster
		 */
		addMonster: function (monster) {
			monster.beAddToGrid(this);
			this.map.monsters.push(monster);
			monster.start();
		},

		/**
		 * 高亮当前格子
		 * @param show {Boolean}
		 */
		hightLight: function (show) {
			this.map.select_hl[show ? "show" : "hide"](this);
		},
		
		render: function () {//TD.log("grid.render");
			var ctx = TD.ctx,
				px = this.x + 0.5,
				py = this.y + 0.5;
				//迷雾效果
				/*if(this.map.is_main_map){//console.log("y:"+this.my+",x:"+this.mx);
					var value=this.image_data[0]
								+this.image_data[1]
								+this.image_data[2]
								+this.image_data[3];
					
					if(value>15)value=15;
								                     
					
					//计算整个title的值
					if(value>0){
						ctx.ctx_real.
							drawImage(TD.image_box,
							parseInt(value/4)*32,
							value%4*32,
							32,
							32,this.x,this.y,32,32
							);
					}else{
						ctx.setFillStyle("black");
							ctx.fillRect(this.x,
							this.y,
							32,
							32);
					}
				}
		
			*/
			//if (this.map.is_main_map) {
			//ctx.drawImage(this.map.res,
			//0, 0, 32, 32, this.x, this.y, 32, 32
			//);
			//}

			if (this.is_hover) {
				ctx.setFillStyle ( "rgba(255, 255, 200, 0.2)");
				ctx.beginPath();
				//TD.log("ctx.fillRect(px, py, this.width, this.height);x:"+px+"y:"+py+"");
				ctx.fillRect(px, py, this.width, this.height);
				
				
				ctx.closePath();
				ctx.fill();
				
			}

			if (this.passable_flag == 0) {
				// 不可通过
				ctx.setFillStyle( "#fcc");
				ctx.beginPath();
				ctx.fillRect(px, py, this.width, this.height);
				ctx.closePath();
				ctx.fill();
			}

			/**
			 * 画入口及出口
			 */
			if (this.is_entrance || this.is_exit) {
				ctx.setLineWidth( 1);
				ctx.setFillStyle ( "#ccc");
				ctx.beginPath();
				ctx.fillRect(px, py, this.width, this.height);
				ctx.closePath();
				ctx.fill();

				ctx.setStrokeStyle ( "#666");
				ctx.setFillStyle ( this.is_entrance ? "#fff" : "#666");
				ctx.beginPath();
				ctx.arc(this.cx, this.cy, TD.grid_size * 0.325, 0, Math.PI * 2, true);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
			}
			
			  
			ctx.setStrokeStyle ( "#eee");
			ctx.setLineWidth(1);
			ctx.beginPath();
			//TD.log("grid.js ctx.fillRect(px, py, this.width, this.height);x:"+px+"y:"+py+"");
			ctx.strokeRect(px, py, this.width, this.height);
			/*var gs2=TD.grid_size/2;
			ctx.moveTo(this.cx - gs2 + 0.5, this.cy - gs2 + 0.5);
			ctx.lineTo(this.cx + gs2 + 0.5, this.cy + gs2 + 0.5);
			
			ctx.moveTo(this.cx - gs2 + 0.5, this.cy + gs2 + 0.5);
			ctx.lineTo(this.cx + gs2 + 0.5, this.cy - gs2 + 0.5);*/
			
			//fillRect(ctx,px, py, this.width, this.height);
		
			//ctx.drawImage(TD.img,px, py, this.width, this.height);
			
			ctx.closePath();
			ctx.stroke();
			//画斜的格子
			
			
		},

		/**
		 * 鼠标进入当前格子事件
		 */
		onEnter: function () {//onEnter事件 通过mix方法 赋值给element
			if (this.map.is_main_map && TD.mode == "build") {
				if (this.build_flag == 1) {
					this.map.pre_building.show();//pre build是 拖着的那个东西
					//
					this.map.pre_building.locate(this);
				} else {
					this.map.pre_building.hide();
				}
			} else if (this.map.is_main_map) {
				var msg = "";
				if (this.is_entrance) {
					msg = TD._t("entrance");
				} else if (this.is_exit) {
					msg = TD._t("exit");
				} else if (this.passable_flag == 0) {
					msg = TD._t("_cant_pass");
				} else if (this.build_flag == 0) {
					msg = TD._t("_cant_build");
				}

				if (msg) {
					this.scene.panel.balloontip.msg(msg, this);
				}
			}
		},

		/**
		 * 鼠标移出当前格子事件
		 */
		onOut: function () {
			// 如果当前气球提示指向本格子，将其隐藏
			if (this.scene.panel.balloontip.el == this) {
				this.scene.panel.balloontip.hide();
			}
		},

		/**
		 * 鼠标点击了当前格子事件
		 */
		onClick: function () {//TD.log("grid de click事件");
			/*
			//设置当前的image_num
			var limit =13;
			if(this.map.is_main_map){
		//+自身
					
	 
		//+右侧
				if(this.image_data[3]!=4){
					this.image_data[3]+=4;
					
				}
	      
	     	if(this.mx<15){
	             			if(this.map.grids[16*this.my+this.mx+1].image_data[1]!=8)
							this.map.grids[16*this.my+this.mx+1].image_data[1]+=8;
			
	             }
	     //+下方
	             	
				if(this.my<15){
	             			if(this.map.grids[16*(this.my+1)+this.mx].image_data[2]!=1)
							this.map.grids[16*(this.my+1)+this.mx].image_data[2]+=1;
	             	}
	      //+右下
	             	if(this.my<15&&this.mx<15){
	             			
	             			if(this.map.grids[16*(this.my+1)+this.mx+1].image_data[0]!=2)
							this.map.grids[16*(this.my+1)+this.mx+1].image_data[0]+=2;
	             	}
			}*/
			if (this.scene.state != 1) return;

			if (TD.mode == "build" && this.map.is_main_map && !this.building) {
				// 如果处于建设模式下，并且点击在主地图的空格子上，则尝试建设指定建筑
				if (this.checkBlock()) {
					// 起点与终点之间被阻塞，不能修建
					this.scene.panel.balloontip.msg(this._block_msg, this);
				} else {
					// 购买建筑
					if(this.map.pre_building.type=="man")
						this.buyMan(this.map.pre_building.type);
						else
					this.buyBuilding(this.map.pre_building.type);
				}
			}  else if (!this.building && this.map.selected_building) {
				// 取消选中建筑
				this.map.selected_building.toggleSelected();
				this.map.selected_building = null;
				//TD.log("grid onClick 清空选择的building");
			}
		},

		/**
		 * 鼠标点击了当前格子事件
		 */
		onRClick: function () {//TD.log("grid de onRClick");
			//if (this.scene.state != 1) return;
			//TD.log("this.map.selected_building"+this.map.selected_building);
			this.scene.panel.balloontip.msg("this.building"+(this.building!=null), this);
			if ( this.map.is_main_map &&!this.building&&this.map.selected_building &&this.map.selected_building.type=="man"&& this.map.selected_building) {
				// 如果处于建设模式下，并且点击在主地图的空格子上，则尝试建设指定建筑
				
				if (this.checkBlock()) {
					// 起点与终点之间被阻塞，不能修建
					this.scene.panel.balloontip.msg(this._block_msg, this);
				} else {
				
					 this.map.selected_building.moveTo(this.mx,this.my);
					
				}
			}  else if (!this.building && this.map.selected_building) {
				// 取消选中建筑
				this.map.selected_building.toggleSelected();
				this.map.selected_building = null;
				
			}
			
		}

	};

	/**
	 * @param id {String}
	 * @param cfg {object} 配置对象
	 *		 至少需要包含以下项：
	 *		 {
	 *			 mx: 在 map 格子中的横向坐标,
	 *			 my: 在 map 格子中的纵向坐标,
	 *			 map: 属于哪个 map,
	 *		 }
	 */
	TD.Grid = function (id, cfg) {//TD.log("新建GRid对象");
		
		cfg.on_events = ["enter", "out", "click","rclick"];

		var grid = new TD.Element(id, cfg);
		TD.lang.mix(grid, grid_obj);
		grid._init(cfg);

		return grid;
	};

}); // _TD.a.push end
