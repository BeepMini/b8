mapper.types.enemy = {

	spawn: function( col, row, props ) {

		const initialDirection = 'D';

		/**
		 * Create enemy character entity.
		 */
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

		// Add PathFollower component if a path is defined
		if ( props.path && b8.Path.validPathSyntax( props.path ) ) {

			let mode = props.mode || 'pingpong';

			const steps = b8.Path.parseCode(
				props.path,
				col,                               // startCol
				row,                               // startRow
				initialDirection                   // initialDir
			);

			const lastStep = steps.length - 1;
			if ( steps[ lastStep ].x === col && steps[ lastStep ].y === row ) {
				mode = 'loop';
			}

			characterProperties.PathFollower = {
				steps,
				index: 0,
				mode,
				dirStep: 1,                     // for pingpong direction: 1 or -1
				timer: 0,                       // accumulates dt
				startDir: props.startDir || initialDirection,
			}

		};

		return b8.ECS.create( characterProperties );

	}

};
