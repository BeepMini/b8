
( function( b8 ) {
	'use strict';

	/**
	 * Lightweight Entity-Component store for b8.
	 * ---------------------------------------------
	 * • Entity: A reference to a collection of data for an object in game. It is a numeric ID. Automatically assigned when using the create() method.
	 * • Component: A property for an entity. The data can be any plain object. Each entity has a key string used as a property name. Loc is reserved for location.
	 * • System: Code that executes commands on entities. There are different systems for different processes.
	 *
	 * All data is stored by reference; mutating the returned
	 * component objects is intentional and fast.
	 */
	b8.ECS = {};

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
	b8.ECS.entitiesAt = function( col, row ) {

		return grid[ row ]?.[ col ] ?? [];

	}


	/**
	 * Register a system that runs every frame.
	 *
	 * @param {Function} fn   System function (dt)=>void
	 * @param {string}   name Unique system name
	 * @param {number}  [order=0] Lower numbers run first
	 */
	b8.ECS.addSystem = function( name, fn, order = 0 ) {

		b8.Utilities.checkFunction( 'fn', fn );
		b8.Utilities.checkString( 'name', name );
		b8.Utilities.checkInt( 'order', order );

		if ( systems.has( name ) ) b8.Utilities.warn( `ECS: overwriting existing system "${name}"` );

		systems.set( name, { fn, order } );

	};


	/**
	 * Add a system a single time. Don't overwite existing systems or add multiple copies.
	 *
	 * @param {Function} fn   System function (dt)=>void
	 * @param {string}   name Unique system name
	 * @param {number}  [order=0] Lower numbers run first
	 */
	b8.ECS.addSystemOnce = function( fn, name, order = 0 ) {

		b8.Utilities.checkFunction( 'fn', fn );
		b8.Utilities.checkString( 'name', name );
		b8.Utilities.checkInt( 'order', order );

		if ( systems.has( name ) ) return;

		b8.ECS.addSystem( fn, name, order );

	};


	/**
	 * Remove a previously-registered system.
	 *
	 * @param {string} name
	 */
	b8.ECS.removeSystem = function( name ) {

		systems.delete( name );

	};


	/**
	 * Run every system in order.
	 * Optionally pass a filter:  (name)=>boolean
	 *
	 * @param {number} dt Delta-time in seconds
	 * @param {(name:string)=>boolean=} filter Skip systems that return false
	 */
	b8.ECS.run = function( dt, filter = () => true ) {

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
	b8.ECS.addComponent = function( id, name = null, data = {} ) {

		b8.Utilities.checkInt( 'id', id );
		b8.Utilities.checkString( 'name', name );
		b8.Utilities.checkObject( 'data', data );

		// Add the new component to the store.
		bucket( name ).set( id, data );

		// If the component is Loc (location), update the position grid.
		if ( 'Loc' === name ) b8.ECS.setLoc( id, data.col, data.row );

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
	b8.ECS.setComponent = function( id, name, data ) {

		b8.ECS.addComponent( id, name, data );

	}


	/**
	 * Set the location of an entity.
	 *
	 * @param {number} id Entity ID
	 * @param {number} col X tile coordinate
	 * @param {number} row Y tile coordinate
	 * @returns {void}
	 */
	b8.ECS.setLoc = function( id, col, row ) {

		b8.Utilities.checkInt( 'id', id );
		b8.Utilities.checkInt( 'col', col );
		b8.Utilities.checkInt( 'row', row );

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
	b8.ECS.getComponents = function( name ) {

		b8.Utilities.checkString( 'name', name );

		return components.get( name ) ?? new Map();

	}


	/**
	 * Return *all* components for a given entity.
	 *
	 * @param {number} id
	 * @returns {Map<string, Object>} Map of name → data
	 */
	b8.ECS.getEntity = function( id ) {

		b8.Utilities.checkInt( 'id', id );

		const out = new Map();
		for ( const [ name, map ] of components ) {
			if ( map.has( id ) ) out.set( name, map.get( id ) );
		}
		return out;

	}


	/**
	 * Get all entity IDs.
	 *
	 * @returns {number[]}
	 */
	b8.ECS.getAllEntities = function() {

		const entitySet = new Set();

		for ( const compMap of components.values() ) {
			for ( const id of compMap.keys() ) {
				entitySet.add( id );
			}
		}

		return [ ...entitySet ];

	}


	/**
	 * Get one specific component for an entity.
	 *
	 * @param {number} id
	 * @param {string} name
	 * @returns {Object|undefined}
	 */
	b8.ECS.getComponent = function( id, name ) {

		b8.Utilities.checkInt( 'id', id );
		b8.Utilities.checkString( 'name', name );

		return components.get( name )?.get( id );

	}


	/**
	 * Check if an entity owns a component.
	 *
	 * @param {number} id
	 * @param {string} name
	 * @returns {boolean}
	 */
	b8.ECS.hasComponent = function( id, name ) {

		b8.Utilities.checkInt( 'id', id );
		b8.Utilities.checkString( 'name', name );

		return components.get( name )?.has( id ) ?? false;

	}


	/**
	 * Remove a single component from an entity.
	 *
	 * @param {number} id
	 * @param {string} name
	 * @returns {void}
	 */
	b8.ECS.removeComponent = function( id, name ) {

		b8.Utilities.checkInt( 'id', id );
		b8.Utilities.checkString( 'name', name );

		components.get( name )?.delete( id );

		// If removing a Loc component, also update the position grid.
		if ( 'Loc' === name ) {
			const loc = this.getComponent( id, 'Loc' );
			if ( loc ) {
				const cell = grid[ loc.row ]?.[ loc.col ];
				if ( cell ) cell.splice( cell.indexOf( id ), 1 );
			}
		}

	}


	/**
	 * Remove an entity entirely (all its components).
	 *
	 * @param {number} id
	 * @returns {void}
	 */
	b8.ECS.removeEntity = function( id ) {

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
	b8.ECS.create = function( bundle ) {

		b8.Utilities.checkObject( 'bundle', bundle );

		const id = makeEntity();
		for ( const [ name, data ] of Object.entries( bundle ) ) {
			b8.ECS.addComponent( id, name, data );
		}
		return id;

	}


	/**
	 * Query for entities that own *all* given components.
	 *
	 * @param {...string} names
	 * @returns {number[]} Array of entity IDs
	 */
	b8.ECS.query = function( ...names ) {

		// If no component names given, return empty array.
		if ( names.length === 0 ) return [];

		// Start with the first component's entities.
		const base = components.get( names[ 0 ] );

		// If no entities have the first component, return empty array.
		if ( !base ) return [];

		// If only one component name, return all its entities.
		if ( names.length === 1 ) return [ ...base.keys() ];

		// Filter the base set by checking other components.
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
	b8.ECS.countByType = function( typeName ) {

		// get all entities with a Type component
		const typeMap = components.get( 'Type' );
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
	b8.ECS.reset = function() {

		components = new Map();
		systems = new Map();
		grid = [];
		nextId = 0;

	}

} )( b8 );


