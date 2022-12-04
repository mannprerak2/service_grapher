const EventEmitter = require('events').EventEmitter

/**
 * Data Wrapper for Graphs, useful for dynamically calculating links between nodes.
 * As describe in the [WebCola Wiki](https://github.com/tgdwyer/WebCola/wiki/General-API-notes), the layout adapter
 * follows [d3.layout.force](https://github.com/mbostock/d3/wiki/Force-Layout) conventions and joins nodes via (JavaScript) reference or array indexes, which normally looks like this:
 *
 * ```javascript
 * const links = [
 * 	{ source: 0, target: 1 },
 * 	{ source: 3, target: 5 }
 * ]
 * ```
 *
 * This wrapper lets you calculate links dynamically based on a reference key, e.g. `id`, so we can use this kind of structure instead:
 *
 * ```javascript
 * const links = [
 * 	{ source: 'A', target: 'B' },
 * 	{ source: 'frontend', target: 'middleware' }
 * ]
 * ```
 *
 */
class Network extends EventEmitter {
	/**
	 * Creates a Network
	 *
	 * @param {Array} nodes - Array of {@link Node}s
	 * @param {Array} links - Array of {@link Link}s - relationships between nodes using the reference key, or array indexes
	 * @param {Object} options
	 * @param {String} options.uid - name of the property of unique identifier, e.g. 'id'
	 */
	constructor (nodes, links, options = {}) {
		super()

		/**
		 * Unique identifier to reference nodes when calculating links
		 *
		 * @property {String} _uid
		 * @private
		 */
		this._uid = options.uid || 'id'

		/**
		 * Array that maps relationships between nodes using
		 * references to array indexes (original d3.js interface).
		 * @property {Array} _links
		 * @private
		 */
		this._links = []

		/**
		 * Array of nodes. See d3.js documentation.
		 * @property {Array} _nodes
		 * @private
		 */
		this._nodes = []

		this._setData(nodes, links, { event: 'created' })
	}

	/**
	 * Updates entire network data set
	 *
	 * @param {Array} nodes - nodes data
	 * @param {Array} links - links data
	 * @param {String} [opts.event = 'update'] - event name after setting data
	 * @param {Boolean} [opts.publish = true] - publish event after resetting data?
	 */
	updateData (nodes, links, opts = {}) {
		// console.log('updateData()', nodes, links)
		// console.log(`[DEBUG]: updateData(nodes, links)`)
		// console.log('    nodes:', nodes)
		// console.log('    links:', links)
		this._setData(nodes, links, opts)
	}

	/**
	 * Fetches network attributes
	 * Currently used for first binding or rendering
	 *
	 * @param {String} attr - attribute to return. Valid attributes are `links` or `nodes`.
	 * @return {Object|Array|null}
	 */
	get (attr) {
		if (attr === 'data')
			return { links: this._links, nodes: this._nodes }
		else if (attr === 'links')
			return this._links
		else if (attr === 'nodes')
			return this._nodes
		else
			return null
	}

	_setData (nodes, links, opts = {}) {
		// console.log(`[DEBUG]: _setData(nodes, links)`)
		// console.log('    nodes:', nodes)
		// console.log('    links:', links)
		const defaults = {
			publish: true,
			event: 'update'
		}
		opts = Object.assign({}, defaults, opts)

		this._nodes = nodes
		this._links = links
		this._validateLinks()
		this._mapNeighbors()
		if (opts.publish) {
			this._publish(opts.event)
		}
	}

	// =========== Nodes ===========

	/**
	 * Find node by id
	 *
	 * @param {String} id
	 * @return {Node} node
	 */
	findNodeById (id) {
		// console.log(`findNodeById(${id})`)
		return this._nodes.find((n) => n[this._uid] === id)
	}

	/**
	 * Finds index of node either by it's unique identifier, e.g. `id` or the node data object itself.
	 *
	 * @param {String|Object} node - id or data object
	 * @return {Integer} index of matched node or `-1` if not found
	 */
	findNodeIndex (node) {
		let id = (typeof node === 'object')
			? node[this._uid]
			: node
		return this._nodes.findIndex((n) => n[this._uid] === id)
	}

	/**
	 * Updates data on a specific node
	 *
	 * @param {String|Node} n - either `id` of node, or the object itself to update
	 * @param {Object} attrs - node data attributes to change. This is merged onto existing attributes, so you only need to pass in updated values.
	 * @return {this}
	 */
	updateNode (n, attrs) {
		let node = (typeof n === 'string')
			? this.findNodeById(n)
			: n
		Object.assign(node, attrs)
		this._publish('update')
		return this
	}

	/**
	 * Removes node _and_ its links from the graph.
	 *
	 * @param {Node} node
	 */
	removeNode (node) {
		const i = this.findNodeIndex(node)
		this._nodes.splice(i, 1)
		this.removeLinks(node)
	}

	/**
	 * Removes node by its `id`.
	 * @param {String} id - id of node to remove
	 */
	removeNodeById (id) {
		let node = this.findNodeById(id)
		this.removeNode(node)
		this._publish('update')
	}

	// =========== Links ===========

	/**
	 * Finds links a given node has. Example results are `[{source: node, target: node}]`
	 *
	 * @param {Node} node
	 * @return {Array} of {@link Link} objets
	 */
	findLinks (node) {
		let links = []
		this._links.forEach((link, i) => {
			if (link.source === node || link.target === node) {
				links.push(link)
			}
		})
		return links
	}

	/**
	 * Removes links for a given node
	 *
	 * @param {Node} node
	 */
	removeLinks (node) {
		let links = this._links
		for (let i = links.length; i--; i >= 0) {
			if (links[i].source === node || links[i].target === node) {
				links.splice(i, 1)
			}
		}
	}

	_isIndexBasedLink (link) {
		let hasZeroIndex = (link.source === 0) || (link.target === 0)
		let isNumber = (typeof link.source === 'number') && (typeof link.target === 'number')
		return isNumber || hasZeroIndex
	}

	/**
	 * Validates links:
	 * - validates have `source` and `target` properties
	 * - converts references by `id` or array index to nodes themselves
	 * - removes links with invalid (missing) source or target nodes
	 *
	 * @private
	 */
	_validateLinks () {
		// console.log('_validateLinks()')
		let missing = []
		this._links.forEach((link, i) => {
			verifyLinkFormat(link)
			let isIndexBased = this._isIndexBasedLink(link)
			let s = isIndexBased ? this._nodes[link.source] : this.findNodeById(link.source)
			let t = isIndexBased ? this._nodes[link.target] : this.findNodeById(link.target)

			if (s !== undefined && t !== undefined) {
				this._links[i] = { source: s, target: t }
			} else {
				// console.log('link is invalid', link)
				missing.push(i)
			}
		})

		this._removeLinksByIndex(missing)
	}

	/**
	 * Removes array by indexes
	 *
	 * @private
	 * @param {Array} indexes - array of indexes sorted low to high, e.g. [1, 5, 10]
	 */
	_removeLinksByIndex (indexes) {
		for (let i = indexes.length; i--; i >= 0) {
			this._links.splice(indexes[i], 1)
		}
	}

	// =========== Events =========== //

	/**
	 * Emits an event
	 *
	 * @private
	 * @param {String} eventName - Event Name, e.g. `update`
	 */
	_publish (eventName) {
		// console.log(`[network event] publish: '${eventName}'`)

		/**
		 * Update event which passes on network data so graph elements,
		 * nodes and links can update themselves based on latest
		 * real-time data.
		 *
		 * @event Network#update
		 * @type {Object}
		 * @property {Array} nodes
		 * @property {Array} links
		 */
		this.emit(eventName, {
			nodes: this._nodes,
			links: this._links
		})
	}

	// =========== Neighbors =========== //

	_mapNeighbors () {
		// console.log('[network] _mapNeighbors()')
		this._neighbors = {}
		this._links.forEach((d) => {
			this._neighbors[`${d.source.id},${d.target.id}`] = true
		})
	}

	/**
	 * Examines the a relationship between the two given nodes. Will return `true` if there is a a source<->target relationship or if the nodes are equal, i.e. the same.
	 *
	 * @param {Node} a - first node
	 * @param {Node} b - second node
	 * @return {Boolean}
	 */
	areNeighbors (a, b) {
		return this.isTargetNeighbor(a, b)
			|| this.isSourceNeighbor(a, b)
			|| this.isEqualNode(a, b)
	}

	/**
	 * Examines if there is a `source -> target` relationship between two specific nodes.
	 *
	 * @param {Node} a - first node
	 * @param {Node} b - second node
	 * @return {Boolean}
	 */
	isSourceNeighbor (a, b) {
		return this._neighbors[`${a.id},${b.id}`] !== undefined
	}

	/**
	 * Examines if node a is includeed in node b's source tree, i.e. if a `source -> ... -> target` relationship between the two nodes.
	 *
	 * @param {Node} a - potential source node
	 * @param {Node} b - potential target node
	 * @return {Boolean}
	 */
	isDeepSourceNeighbor (a, b) {
		let sources = this.findDeepSources(b)
		return sources.length > 0
			? sources.includes(a)
			: false
	}

	/**
	 * Examines if there is a `b -> a` relationship between two specific nodes.
	 *
	 * @param {Node} a - potential `target` node
	 * @param {Node} b - potential `source` node
	 * @return {Boolean}
	 */
	isTargetNeighbor (a, b) {
		return this._neighbors[`${b.id},${a.id}`]
	}

	/**
	 * Returns true if the nodes examined are equal, i.e. the same node
	 *
	 * @param {String} a - id of node A
	 * @param {String} b - id of node B
	 * @return {Boolean}
	 */
	isEqualNode (a, b) {
		return a.id === b.id
	}

	/**
	 * Returns Array of nodes in the source tree of a specific node.
	 *
	 * @param {Node} n - node to get source tree
	 * @return {Array}
	 */
	findSources (n) {
		let sources = []
		this._links.forEach((i) => {
			if (i.target === n) {
				sources.push(i.source)
			}
		})
		return sources
	}

	/**
	 * Recursively finds all deep sources of a node, i.e. does not include direct source.
	 *
	 * @param {Node} n - node to get source tree
	 * @param {Array} [sources=[]]
	 * @param {Array} [level=0]
	 * @return {Array}
	 */
	findDeepSources (n, sources = [], level = 0) {
		// console.log(`-- findDeepSources(${n.label}) --`)
		this._links.forEach((l) => {
			if (l.target === n) {
				if (level !== 0) {
					sources.push(l.source)
				}

				let parents = this.findSources(n)
				if (parents.length === 0) { return }
				parents.forEach((a) => this.findDeepSources(a, sources, level + 1))
			}
		})

		const uniques = [...new Set(sources)]
		return uniques
	}

	/**
	 * Returns `true` if link can be found in the node's source tree.
	 *
	 * @param {Link} link
	 * @param {Node} n
	 * @return {Boolean}
	 */
	isDeepSourceLink (link, n) {
		let sourceIsASource = this.isDeepSourceNeighbor(link.source, n)
		let targetIsASource = this.isDeepSourceNeighbor(link.target, n) || this.isSourceNeighbor(link.target, n)
		let isDeepLink = sourceIsASource && targetIsASource
		// console.log(`Does [${link.source.label}] -> [${link.target.label}] deep link to [${n.label}]? `, isDeepLink)
		return isDeepLink
	}

	/**
	 * Returns relationship type between node and its neighbor. Will return one of the following:
	 * | Key | Relationship type |
	 * |:--|:--|
	 * | `'is-source'` | node -> neighbor |
	 * | `'is-deep-source'` | node -> … -> neighbor |
	 * | `'is-target'` | neighbor -> node |
	 * | `'is-same-node'` | node === neighbor |
	 * | `'has-no-relationship'` | There is no relationship between the two nodes |
	 *
	 * @param {Node} node
	 * @param {Node} neighbor
	 * @return {String}
	 */
	getRelationship (node, neighbor) {
		let rel = ''
		if (this.isSourceNeighbor(node, neighbor)) {
			rel = 'is-source'
		} else if (this.isDeepSourceNeighbor(node, neighbor)) {
			rel = 'is-deep-source'
		} else if (this.isTargetNeighbor(node, neighbor)) {
			rel = 'is-target'
		} else if (this.isEqualNode(node, neighbor)) {
			rel = 'is-same-node'
		} else {
			rel = 'has-no-relationship'
		}
		return rel
	}
}

function verifyLinkFormat (link) {
	if (!(link.hasOwnProperty('source') && link.hasOwnProperty('target'))) {
		throw {
			error: 'Improperly formatted link',
			link: link
		}
	}
}
module.exports = Network