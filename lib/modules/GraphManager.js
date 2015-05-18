//Private
var Inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var FlowNode = require('../modules/FlowNode');

// Set up this module for emitting events
Inherits(GraphManager, EventEmitter);

//Public

module.exports = GraphManager;

/**
 * The GraphManager module is responsible for keeping track of the nodes and edges in the visualization.
 *
 * @param {Renderer}    renderer  The renderer object
 * @param {Layout} layout The layout object
 *
 * @constructor Sets parameters.
 */
function GraphManager(renderer, layout) {
    this.renderer = renderer;
    this.layout = layout;
    this.nodes = [];
    this.edges = [];
}

/**
 * Creates a new node of specified type and adds it to the main visualization, triggering a Renderer update.
 *
 * @param {NodeType}  type    Type of a node to be created
 * @param {Number}      x           The initial X position of this node in the visualization.
 * @param {Number}      y           The initial Y position of this node in the visualization.
 */
GraphManager.prototype.AddNode = function(type, x, y) {
    this.nodes.push(new FlowNode(type, x, y));
    this.renderer.SetNodeListRef(this.nodes);
    this.renderer.Update();
};

/**
 * Creates a new node of specified type and adds it to the main visualization, triggering a Renderer update.
 * The coordinates for the new node are obtained from the Layout module.
 *
 * @param {NodeType}  type    Type of a node to be created
 */
GraphManager.prototype.AddNodeAutoLayout = function(type) {
    var coords = this.layout.GetNewNodeCoords(this.nodes);
    this.AddNode(type, coords[0], coords[1]);
};