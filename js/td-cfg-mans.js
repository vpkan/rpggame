/**
 *
 *
 * Author:
 *	zzw <zzw1986@gmail.com>
 *	
 *
 * File: td-cfg-mans.js
 *
 * Create Date: 2013-9-123 00:37:00
 *
 * 本文件定义了人的参数、属性
 */

// _TD.a.push begin

_TD.a.push(function (TD) {
	/**
	 * 默认的升级规则
	 * @param old_level {Number}
	 * @param old_value {Number}
	 * @return new_value {Number}
	 */
	TD.default_upgrade_rule = function (old_level, old_value) {
		return old_value * 1.2;
	};
	/**
	 * 取得建筑的默认属性
	 * @param building_type {String} 建筑类型
	 */
	TD.getDefaultManAttributes = function (man_type) {

		var man_attributes = {
			// 战士
			"man": {
				r:TD.grid_size/2,
				damage: 12,
				render_level:4,
				range: 4,
				max_range: 8,
				speed: 50,
				bullet_speed: 6,
				image:'img/npc1.gif',
				life: 100,
				shield: 100,
				cost: 300,
				_upgrade_rule_damage: function (old_level, old_value) {
					return old_value * (old_level <= 10 ? 1.2 : 1.3);
				}
			}
		};
		return man_attributes[man_type] || {};
	};

}); // _TD.a.push end
