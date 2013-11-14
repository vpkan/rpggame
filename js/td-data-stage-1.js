/**
 *
 * Author:
 *	zzw <oldj.wu@gmail.com>
 *	
 * File: td-data-stage-1.js
 *
 * Create Date: 2010-11-18 16:01:22
 *
 * 默认关卡
 */

// _TD.a.push begin
_TD.a.push(function (TD) {

// main stage 初始化方法
	var _stage_main_init = function () {
		//TD.log("act 对象创建");
			//TD.log("scene 对象创建");
			//TD.log("cfg 对象创建");
		var act = new TD.Act(this, "act-1"),//stage里还有Act
		scene = new TD.Scene(act, "scene-1"),//act里有Scene scene表是代表第一波开始
	
		
		cfg = TD.getDefaultStageData("scene_endless");//得到名字为scene_endless的相关配置文件
		
		var backGround=new TD.BackGround("background-1",cfg);
		//this.backGround.src="img/8.jpg";
		//bgimg.image=background_img;
		backGround.addToScene(scene, 0, 1, []);
		
		this.config = cfg.config;
		TD.life = this.config.life;
		TD.money = this.config.money;
		TD.score = this.config.score;
		TD.difficulty = this.config.difficulty;
		TD.wave_damage = this.config.wave_damage;
		
		
		// make map
	
		//console.log(cfg.map);//初始化了grid
		var map = new TD.Map("main-map", TD.lang.mix({
			scene: scene,
			is_main_map: true,
			step_level: 1,
			render_level: 2
		}, cfg.map));
		//cfg.map有好多grid 将map.grides加入到场景中 并且确认map的场景
		map.addToScene(scene, 1, 2, map.grids);
		scene.map = map;//互相关联
		/*var man =new TD.Man(this,"man-1");
		man.addToMap(man);*/

		// make panel
		scene.panel = new TD.Panel("panel", TD.lang.mix({
			scene: scene,
			main_map: map,
			step_level: 1,
			render_level: 7
		}, cfg.panel));

		this.newWave = cfg.newWave;
		this.map = map;
		this.wait_new_wave = this.config.wait_new_wave;
	},
	_stage_main_step2 = function () {
		//TD.log(this.current_act.current_scene.wave);

		var scene = this.current_act.current_scene,
			wave = scene.wave;
		if ((wave == 0 && !this.map.has_weapon) || scene.state != 1) {
			return;
		}

		if (this.map.monsters.length == 0) {
			if (wave > 0 && this.wait_new_wave == this.config.wait_new_wave - 1) {
				// 一波怪物刚刚走完
				// 奖励生命值

				var wave_reward = 0;
				if (wave % 10 == 0) {
					wave_reward = 10;
				} else if (wave % 5 == 0) {
					wave_reward = 5;
				}
				if (TD.life + wave_reward > 100) {
					wave_reward = 100 - TD.life;
				}
				if (wave_reward > 0) {
						TD.recover(wave_reward);
				}
			}

			if (this.wait_new_wave > 0) {
				this.wait_new_wave --;
				return;
			}

			this.wait_new_wave = this.config.wait_new_wave;
			wave ++;
			scene.wave = wave;
			this.newWave({
				map: this.map,
				wave: wave
			});
		}
	};
	//k的值是 stage_main   scene_endless
	TD.getDefaultStageData = function (k) {//TD.log("TD.getDefaultStageData 拿到配置文件");
		var data = {
			stage_main: {
				width: 640, // px
				height: 560,
				init: _stage_main_init,
				step2: _stage_main_step2
			},

			scene_endless: {
				// scene 1
				map: {
					grid_x: TD.width,//x坐标上有16个格子
					grid_y: TD.height,//y坐标上有16个格子
					x: TD.padding,
					y: TD.padding,
					entrance: [0, 0],//入口的位置
					exit: [15, 15],//出口的位置
					grids_cfg: [
						{
							pos: [3, 3],
							//building: "cannon",
							passable_flag: 0//是否可以经过
						},
						{
							pos: [7, 15],
							build_flag: 0
						},
						{
							pos: [4, 12],
							building: "wall"
						},{
							pos: [5, 12],
							man: "man"
						},
						{
							pos: [4, 13],
							building: "wall"
							//}, {
							//pos: [11, 9],
							//building: "cannon"
							//}, {
							//pos: [5, 2],
							//building: "HMG"
							//}, {
							//pos: [14, 9],
							//building: "LMG"
							//}, {
							//pos: [3, 14],
							//building: "LMG"
						}
					]
				},
				panel: {
					x: TD.padding * 2 + TD.grid_size * 16,//x轴的其实位置
					y: TD.padding,//y的起始位置
					map: {
						grid_x: 3,
						grid_y: 3,
						x: 0,
						y: 110,
						grids_cfg: [
							{
								pos: [0, 0],
								building: "cannon",
								type:"build"
							},
							{
								pos: [1, 0],
								building: "LMG",
								type:"build"
							},
							{
								pos: [2, 0],
								building: "HMG",
								type:"build"
							},
							{
								pos: [1,1],
								building: "ice_gun",
								type:"build"
							},
							{
								pos: [0, 1],
								building: "laser_gun",
								type:"build"
							},
							{
								pos: [2, 2],
								building: "wall",
								type:"build"
							}
							,
							{
								pos: [1, 2],
								man: "man",
								type:"man"
							}
						]
					}
				},
				config: {
					endless: true,
					wait_new_wave: TD.exp_fps * 3, // 经过多少 step 后再开始新的一波
					difficulty: 1.0, // 难度系数
					wave: 0,
					max_wave: -1,
					wave_damage: 0, // 当前一波怪物造成了多少点生命值的伤害
					max_monsters_per_wave: 100, // 每一波最多多少怪物
					money: 500,
					score: 0, // 开局时的积分
					life: 100,
					waves: [ // 这儿只定义了前 10 波怪物，从第 11 波开始自动生成
						[],
						// 第一个参数是没有用的（第 0 波）

						// 第一波
						[
							[1, 0] // 1 个 0 类怪物
						],

						// 第二波
						[
							[1, 0], // 1 个 0 类怪物
							[1, 1] // 1 个 1 类怪物
						],

						// wave 3
						[
							[2, 0], // 2 个 0 类怪物
							[1, 1] // 1 个 1 类怪物
						],

						// wave 4
						[
							[2, 0],
							[1, 1]
						],

						// wave 5
						[
							[3, 0],
							[2, 1]
						],

						// wave 6
						[
							[4, 0],
							[2, 1]
						],

						// wave 7
						[
							[5, 0],
							[3, 1],
							[1, 2]
						],

						// wave 8
						[
							[6, 0],
							[4, 1],
							[1, 2]
						],

						// wave 9
						[
							[7, 0],
							[3, 1],
							[2, 2]
						],

						// wave 10
						[
							[8, 0],
							[4, 1],
							[3, 2]
						]
					]
				},

				/**
				 * 生成第 n 波怪物的方法
				 */
				newWave: function (cfg) {
					cfg = cfg || {};
					var map = cfg.map,
						wave = cfg.wave || 1,
						//difficulty = TD.difficulty || 1.0,
						wave_damage = TD.wave_damage || 0;

					// 自动调整难度系数
					if (wave == 1) {
						//pass
					} else if (wave_damage == 0) {
						// 没有造成伤害
						if (wave < 5) {
							TD.difficulty *= 1.05;
						} else if (TD.difficulty > 30) {
							TD.difficulty *= 1.1;
						} else {
							TD.difficulty *= 1.2;
						}
					} else if (TD.wave_damage >= 50) {
						TD.difficulty *= 0.6;
					} else if (TD.wave_damage >= 30) {
						TD.difficulty *= 0.7;
					} else if (TD.wave_damage >= 20) {
						TD.difficulty *= 0.8;
					} else if (TD.wave_damage >= 10) {
						TD.difficulty *= 0.9;
					} else {
						// 造成了 10 点以内的伤害
						if (wave >= 10)
							TD.difficulty *= 1.05;
					}
					if (TD.difficulty < 1) TD.difficulty = 1;

					//TD.log("wave " + wave + ", last wave damage = " + wave_damage + ", difficulty = " + TD.difficulty);

					//map.addMonsters(100, 7);
					//map.addMonsters2([[10, 7], [5, 0], [5, 5]]);
					//
					var wave_data = this.config.waves[wave] ||
						// 自动生成怪物
						TD.makeMonsters(Math.min(
							Math.floor(Math.pow(wave, 1.1)),
							this.config.max_monsters_per_wave
						));
					map.addMonsters2(wave_data);

					TD.wave_damage = 0;
				},
				/**
				 * 背景
				 */
				getBGImage: function (cfg) {
					/*cfg = cfg || {};
					var backGround = cfg.backGround;
					*/
					var images=
					[//name, src , 
						["bgimg","img/grass.jpg",0,0],
						["1","img/1.jpg",0,0],
						["2","img/2.jpg",0,0],
						["3","img/3.jpg",0,0],
						["4","img/4.jpg",0,0],
						["5","img/5.jpg",0,0],
						["6","img/6.jpg",0,0],
						["7","img/7.jpg",0,0],
						["8","img/8.jpg",0,0],
						["grass","img/grass.jpg",0,0],
						["0","",0,0],
						["npc1","npc1.gif",0,0,104,85],
						["grass2","img/grass2.PNG",0,0]
					];
					return images[2];
				
				}
			} // end of scene_endless
		};
		return data[k] || {};//返回相关元素
	};

}); // _TD.a.push end


