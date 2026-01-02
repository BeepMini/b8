mapper.types.start = {

	spawn: function( col, row, props = {} ) {

		mapper.lastDoorway = { col, row };

		b8.ECS.setLoc( mapper.player, col, row );

	},

};
