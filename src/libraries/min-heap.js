/**
 * A simple implementation of a MinHeap (binary heap) for managing priority queues.
 * This data structure ensures efficient insertion and extraction of the smallest element.
 *
 * Time Complexity:
 * - Insertion: O(log n)
 * - Extraction: O(log n)
 * - Accessing the smallest element: O(1)
 */
class MinHeap {

	/**
	 * Initializes an empty heap.
	 */
	constructor() {
		/**
		 * Internal array to store heap elements.
		 * @type {Array<Object>}
		 */
		this.heap = [];
	}

	/**
	 * Inserts a new node into the heap.
	 * @param {Object} node - The node to insert. Must have a property `f` for priority comparison.
	 */
	push( node ) {
		this.heap.push( node );
		this.bubbleUp( this.heap.length - 1 );
	}

	/**
	 * Removes and returns the smallest node (root) from the heap.
	 * @returns {Object} The node with the smallest `f` value.
	 */
	pop() {
		if ( this.heap.length === 1 ) return this.heap.pop();
		const min = this.heap[ 0 ];
		this.heap[ 0 ] = this.heap.pop();
		this.bubbleDown( 0 );
		return min;
	}

	/**
	 * Returns the number of elements in the heap.
	 * @returns {number} The size of the heap.
	 */
	get length() {
		return this.heap.length;
	}

	/**
	 * Moves the element at the given index up to restore the heap property.
	 * @param {number} index - The index of the element to bubble up.
	 */
	bubbleUp( index ) {
		const parent = Math.floor( ( index - 1 ) / 2 );
		if ( parent >= 0 && this.heap[ index ].f < this.heap[ parent ].f ) {
			[ this.heap[ index ], this.heap[ parent ] ] = [ this.heap[ parent ], this.heap[ index ] ];
			this.bubbleUp( parent );
		}
	}

	/**
	 * Moves the element at the given index down to restore the heap property.
	 * @param {number} index - The index of the element to bubble down.
	 */
	bubbleDown( index ) {
		const left = 2 * index + 1;
		const right = 2 * index + 2;
		let smallest = index;

		if ( left < this.heap.length && this.heap[ left ].f < this.heap[ smallest ].f ) {
			smallest = left;
		}
		if ( right < this.heap.length && this.heap[ right ].f < this.heap[ smallest ].f ) {
			smallest = right;
		}
		if ( smallest !== index ) {
			[ this.heap[ index ], this.heap[ smallest ] ] = [ this.heap[ smallest ], this.heap[ index ] ];
			this.bubbleDown( smallest );
		}
	}

}