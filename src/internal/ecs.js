
( function( beep8 ) {
	'use strict';

	/**
	 * Lightweight Entity-Component store for Beep8.
	 * ---------------------------------------------
	 * • Entity: A reference to a collection of data for an object in game. It is a numeric ID. Automatically assigned when using the create() method.
	 * • Component: A property for an entity. The data can be any plain object. Each entity has a key string used as a property name. Loc is reserved for location.
	 * • System: Code that executes commands on entities. There are different systems for different processes.
	 *
	 * All data is stored by reference; mutating the returned
	 * component objects is intentional and fast.
	 */
	beep8.ECS = {};

	// auto-incrementing entity IDs
	let nextId = 0;

	// Map<name, Map<id, data>>
	let components = new Map();

	// Grid for positional queries.
	// To keep this up to date you must use setLoc() to move entities.
	let grid = [];

	// Map<name, function> for systems
	let systems = new Map();



	/**
	 * Create a new unique entity ID.
	 *
	 * @returns {number}
	 */
	function makeEntity() {

		return nextId++;

	}


	/**
	 * Ensure a component bucket exists and return it.
	 *
	 * @param {string} name
	 * @returns {Map<number, Object>}
	 * @private
	 */
	function bucket( name ) {

		// If component store doesn't exist, create it.
		if ( !components.has( name ) ) components.set( name, new Map() );
		// Return the store.
		return components.get( name );

	}


	/**
	 * Get all entities at a specific grid location.
	 *
	 * @param {number} col
	 * @param {number} row
	 * @returns {number[]} Array of entity IDs at that location
	 */
	beep8.ECS.entitiesAt = function( col, row ) {

		return grid[ row ]?.[ col ] ?? [];

	}


	/**
	 * Register a system that runs every frame.
	 *
	 * @param {Function} fn   System function (dt)=>void
	 * @param {string}   name Unique system name
	 * @param {number}  [order=0] Lower numbers run first
	 */
	beep8.ECS.addSystem = function( name, fn, order = 0 ) {

		beep8.Utilities.checkFunction( 'fn', fn );
		beep8.Utilities.checkString( 'name', name );
		beep8.Utilities.checkInt( 'order', order );

		if ( systems.has( name ) ) beep8.Utilities.warn( `ECS: overwriting existing system "${name}"` );

		systems.set( name, { fn, order } );

	};


	/**
	 * Add a system a single time. Don't overwite existing systems or add multiple copies.
	 *
	 * @param {Function} fn   System function (dt)=>void
	 * @param {string}   name Unique system name
	 * @param {number}  [order=0] Lower numbers run first
	 */
	beep8.ECS.addSystemOnce = function( fn, name, order = 0 ) {

		beep8.Utilities.checkFunction( 'fn', fn );
		beep8.Utilities.checkString( 'name', name );
		beep8.Utilities.checkInt( 'order', order );

		if ( systems.has( name ) ) return;

		beep8.ECS.addSystem( fn, name, order );

	};


	/**
	 * Remove a previously-registered system.
	 *
	 * @param {string} name
	 */
	beep8.ECS.removeSystem = function( name ) {

		systems.delete( name );

	};


	/**
	 * Run every system in order.
	 * Optionally pass a filter:  (name)=>boolean
	 *
	 * @param {number} dt Delta-time in seconds
	 * @param {(name:string)=>boolean=} filter Skip systems that return false
	 */
	beep8.ECS.run = function( dt, filter = () => true ) {

		[ ...systems.entries() ]
			// Sort by order/ priority.
			.sort( ( a, b ) => a[ 1 ].order - b[ 1 ].order )   // order ASC
			// Execute each system in priority order.
			.forEach(
				( [ name, { fn } ] ) => {
					if ( filter( name ) ) fn( dt );
				}
			);

	};


	/**
	 * Attach or overwrite a component on an entity.
	 *
	 * @param {number} id Entity ID
	 * @param {string} name Component name
	 * @param {Object} [data={}] Component data (stored by reference)
	 * @returns {void}
	 */
	beep8.ECS.add = function( id, name = null, data = {} ) {

		beep8.Utilities.checkInt( 'id', id );
		beep8.Utilities.checkString( 'name', name );
		beep8.Utilities.checkObject( 'data', data );

		// Add the new component to the store.
		bucket( name ).set( id, data );

		// If the component is Loc (location), update the position grid.
		if ( 'Loc' === name ) beep8.ECS.setLoc( id, data.col, data.row );

	}


	/**
	 * Set a component on an entity, overwriting any existing data.
	 * This is a convenience method for add().
	 *
	 * @param {number} id Entity ID
	 * @param {string} name Component name
	 * @param {Object} data Component data (stored by reference)
	 * @returns {void}
	 */
	beep8.ECS.set = function( id, name, data ) {

		beep8.ECS.add( id, name, data );

	}


	/**
	 * Set the location of an entity.
	 *
	 * @param {number} id Entity ID
	 * @param {number} col X tile coordinate
	 * @param {number} row Y tile coordinate
	 * @returns {void}
	 */
	beep8.ECS.setLoc = function( id, col, row ) {

		beep8.Utilities.checkInt( 'id', id );
		beep8.Utilities.checkInt( 'col', col );
		beep8.Utilities.checkInt( 'row', row );

		// Get the current location component.
		const loc = this.getComponent( id, 'Loc' );

		// Remove from old position.
		const oldRow = grid[ loc.row ];
		if ( oldRow ) {
			const cell = oldRow[ loc.col ];
			if ( cell ) {
				const i = cell.indexOf( id );
				if ( i !== -1 ) cell.splice( i, 1 );
			}
		}

		// Update component position.
		loc.col = col;
		loc.row = row;

		// Save new grid location.
		if ( !grid[ row ] ) grid[ row ] = [];
		if ( !grid[ row ][ col ] ) grid[ row ][ col ] = [];
		grid[ row ][ col ].push( id );

	}


	/**
	 * Get the component map for a given component name.
	 *
	 * @param {string} name
	 * @returns {Map<number,Object>} Map<entityId,data>
	 */
	beep8.ECS.get = function( name ) {

		beep8.Utilities.checkString( 'name', name );

		return components.get( name ) ?? new Map();

	}


	/**
	 * Return *all* components for a given entity.
	 *
	 * @param {number} id
	 * @returns {Map<string, Object>} Map of name → data
	 */
	beep8.ECS.getEntity = function( id ) {

		beep8.Utilities.checkInt( 'id', id );

		const out = new Map();
		for ( const [ name, map ] of components ) {
			if ( map.has( id ) ) out.set( name, map.get( id ) );
		}
		return out;

	}


	/**
	 * Get one specific component for an entity.
	 *
	 * @param {number} id
	 * @param {string} name
	 * @returns {Object|undefined}
	 */
	beep8.ECS.getComponent = function( id, name ) {

		return components.get( name )?.get( id );

	}


	/**
	 * Check if an entity owns a component.
	 *
	 * @param {number} id
	 * @param {string} name
	 * @returns {boolean}
	 */
	beep8.ECS.hasComponent = function( id, name ) {

		return components.get( name )?.has( id ) ?? false;

	}


	/**
	 * Remove a single component from an entity.
	 *
	 * @param {number} id
	 * @param {string} name
	 * @returns {void}
	 */
	beep8.ECS.removeComponent = function( id, name ) {

		components.get( name )?.delete( id );

	}


	/**
	 * Remove an entity entirely (all its components).
	 *
	 * @param {number} id
	 * @returns {void}
	 */
	beep8.ECS.removeEntity = function( id ) {

		const loc = this.getComponent( id, 'Loc' );

		if ( loc ) {
			const cell = grid[ loc.row ]?.[ loc.col ];
			if ( cell ) cell.splice( cell.indexOf( id ), 1 );
		}

		for ( const store of components.values() ) store.delete( id );

	}


	/**
	 * Create an entity from a bundle of components.
	 *
	 * @param {Object.<string, Object>} bundle Keys = component names
	 * @returns {number} The new entity ID
	 */
	beep8.ECS.create = function( bundle ) {

		const id = makeEntity();
		for ( const [ name, data ] of Object.entries( bundle ) ) {
			beep8.ECS.add( id, name, data );
		}
		return id;

	}


	/**
	 * Query for entities that own *all* given components.
	 *
	 * @param {...string} names
	 * @returns {number[]} Array of entity IDs
	 */
	beep8.ECS.query = function( ...names ) {

		if ( names.length === 0 ) return [];
		const base = components.get( names[ 0 ] );

		if ( !base ) return [];

		return [ ...base.keys() ].filter( id =>
			names.every( n => components.get( n )?.has( id ) )
		);

	}


	/**
	 * Count entities by type.
	 *
	 * @param {string} typeName
	 * @returns {number}
	 */
	beep8.ECS.countByType = function( typeName ) {

		// get all entities with a Type component
		const typeMap = this.get( 'Type' );
		if ( !typeMap ) return 0;

		let count = 0;

		for ( const comp of typeMap.values() ) {
			if ( comp.name === typeName ) count++;
		}

		return count;

	}


	/**
	 * Reset the ECS (clears all entities & components).
	 *
	 * @returns {void}
	 */
	beep8.ECS.reset = function() {

		components = new Map();
		systems = new Map();
		grid = [];
		nextId = 0;

	}

} )( beep8 || ( beep8 = {} ) );


