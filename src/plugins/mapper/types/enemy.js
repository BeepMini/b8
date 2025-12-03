mapper.types.enemy = {

	spawn: function( col, row, props ) {

		const characterProperties = {
			Type: { name: 'enemy' },
			Loc: { col, row },
			Sprite: {
				type: 'actor',
				tile: parseInt( props.actor ) || 6,
				fg: props.fg || 15,
				bg: props.bg || 0,
				depth: 50,
			},
			Solid: {},
			CharacterAnimation: {
				name: 'idle',
				default: 'idle',
				duration: 0,
			},
		};

		if ( props.path && b8.Path.validPathSyntax( props.path ) ) {

			characterProperties.PathFollower = {
				mode: props.pathMode || 'loop', // "loop" | "pingpong" | "once"
				steps: b8.Path.parseCode(
					props.path,
					row,                               // startRow
					col,                               // startCol
					'D'                                // initialDir
				), // filled on first update
				index: 0,
				dirStep: 1,                     // for pingpong: 1 or -1
				timer: 0,                       // accumulates dt
				startDir: props.startDir || 'D',
			}

		};

		return b8.ECS.create( characterProperties );

	}

};
