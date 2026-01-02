mapper.types.start = {

	spawn: function( col, row, props = {} ) {

		mapper.lastPosition = {
			col,
			row,
			map: mapper.currentMapId
		};

		b8.ECS.setLoc( mapper.player, col, row );

	},

};
