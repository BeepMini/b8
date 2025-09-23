mapper.actions.read = async function( playerId ) {

	const entities = mapper.entitiesAhead( playerId );

	for ( const id of entities ) {
		const obj = beep8.ECS.getComponent( id, 'Message' );
		const sprite = beep8.ECS.getComponent( id, 'Sprite' );

		if ( !obj || !sprite ) continue;

		beep8.color( sprite.fg ?? 15, sprite.bg ?? 5 );
		await beep8.Async.dialogTypewriter( obj.message, [ "OK" ], 20 );
	}

};