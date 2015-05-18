//Private
var Inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

Inherits(Layout, EventEmitter);

// Public
module.exports = Layout;

/**
 * The Layout module is responsible for laying out nodes in the graph.
 *
 *
 * @constructor Sets parameters
 */
function Layout() {
}

/**
 * Returns the coordinates for a new node.
 *
 * @param {object}  nodes    A list of existing nodes in the graph.
 *
 * @return {object} A list of x,y coordinates.
 */
Layout.prototype.GetNewNodeCoords = function(nodes) {
    //TODO do the actual layout
    return [0,300];

};