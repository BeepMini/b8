mapper.CONFIG = {

	// Time in seconds between repeated player movement steps while holding a
	// direction. This remains frame-time based so movement still feels smooth.
	moveDelay: 0.2,

	// General action delay in seconds. This is kept for compatibility with
	// older mapper behavior and action flows that still read this value.
	actionDelay: 0.5,

	// Time in seconds an entity with Health stays invulnerable after taking
	// damage. This still uses frame time rather than turn time.
	healthCooldown: 1.2,

	// Time in seconds before the same action button can be used again. This
	// helps stop held buttons from firing interaction logic every frame.
	keyPressDelay: 0.25,

	// Time in seconds between enemy AI decisions, such as choosing a patrol,
	// chase, or attack intent.
	aiUpdateDelay: 0.5,

	// Time in seconds between automatic path follower tile steps.
	pathFollowerStepDelay: 0.4,

	// Time in seconds for a manually lit bomb fuse before it explodes.
	bombFuseSeconds: 5,

	// Time in seconds a regular fire survives before burning out. This keeps the
	// recently increased fire lifetime while allowing it to expire in real time.
	fireLifetimeSeconds: 10,

	// Heat gained per second by an entity next to a fire. With the default
	// threshold and cooling values, a crate ignites after roughly 1.7 seconds.
	fireHeatPerSecond: 70,

	// Heat lost per second by a flammable entity that is not being heated.
	flammableCoolingPerSecond: 10,

	// Temperature at which a flammable entity ignites and runs its burn logic.
	flammableIgniteThreshold: 100,

	// Time in seconds a fire-small effect stays attached to a burning entity.
	fireSmallDurationSeconds: 3,

	// Damage dealt per second by a fire-small effect.
	fireSmallDamagePerSecond: 0.75,

	/**
	 * Horizontal tile offset applied when drawing the map and entities.
	 * Use this to leave room for borders or UI framing.
	 */
	mapOffsetX: 1,

	/**
	 * Vertical tile offset applied when drawing the map and entities.
	 * Use this to leave room for borders or UI framing.
	 */
	mapOffsetY: 1,

	// Encoded tilemap data for the in-game HUD panel drawn beneath the map.
	gameUI: `hpgYhRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGGEIAACghRhhCAAAoIUYYQgAAKCFGJUHAACghRiVBwAAoIUYlQcAAKCFGJUKAACgmBiFGBwHBgCghRgZBwYAoIUYGQcGAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFDAYHAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFGBkHBgCghRgZBwYAoIUYGQcGAKCFGB0HBgCghRgZBwgAoIUYIAgHAKCFGCsHBgCghRkBXAoAAKCYGIUYKwYHAKCFEgAHAKCFAAgAAKCFAAgAAKCFAAgAAKCFAwEAAKCFAAgAAKCFAA8AAKCFEwAHAKCFAQcGAKCFGQG0CgcAoIUBBwYAoIUBBwYAoIUBBwYAoIUZAbUKBwCghQEHBgCghQEHBgCghQEHBgCghQEHBgCghREGBwCghQAAAACghRMABwCghRgrBwYAoIUZAV4KAACgmBiFGCsGBwCghQEABwCghRkBnwgAAKCFGQGfCAAAoIUZAZ8IAACghRkBnwgAAKCFGQGfCAAAoIUZAZ8IAACghQEABwCghRg9AAEAoIUYPQABAKCFGD0AAQCghRg9AAEAoIUYPQABAKCFGD0AAQCghRg9AAEAoIUYPQABAKCFGD4AAQCghQEHBgCghRgrBwYAoIUAAAAAoIUAAAAAoIUYKwcGAKCFGQFdCgAAoJgYhRgrBgcAoIUBAAcAoIUBAAEAoIUADgAAoIUADwAAoIUADwAAoIUADwAAoIUADwAAoIUAAQAAoIUABQEAoIUBAQcAoIUBAQcAoIUBAQcAoIUBAQcAoIUBAQcAoIUBAQcAoIUBAQcAoIUYUAABAKCFAAYHAKCFGCsHBgCghQAAAACghRglAAcAoIUYKwcGAKCFGQFeCgAAoJgYhRguBwYAoIUBAAEAoIUAAQAAoIUAAQAAoIUAAQAAoIUAAQAAoIURAQAAoIURAQAAoIUBAAEAoIUYYQABAKCFGGEAAQCghRhhAAEAoIUYYQABAKCFGGEAAQCghRhhAAEAoIURBgEAoIURBgEAoIUYYgABAKCFEQYHAKCFGC8HBgCghRgZBgcAoIUYGQYHAKCFGDEHBgCghRkBXQoAAKA=`,

};
