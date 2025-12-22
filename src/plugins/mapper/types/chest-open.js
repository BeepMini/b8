mapper.types.chestOpen = {

	spawn: function( col, row, props ) {

		const entitySettings = {
			Type: { name: 'chest' },
			Loc: { col, row },
			Sprite: {
				tile: 271,
				fg: props.fg || 15,
				bg: props.bg || 0,
				depth: 10
			},
			Solid: {},
		};

		console.log( 'chest open props', props );

		if ( props.message ) {
			entitySettings.Message = { message: props.message };
			entitySettings.Action = { verb: 'read' };
		}

		return b8.ECS.create( entitySettings );

	},

};