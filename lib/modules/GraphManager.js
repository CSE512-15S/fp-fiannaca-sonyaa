//Private
var Inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var FlowNode = require('../modules/FlowNode');
var FlowEdge = require('../modules/FlowEdge');

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
function GraphManager(renderer, layout, config) {
    this.renderer = renderer;
    this.layout = layout;
    this.nodes = [];
    this.edges = [];

    var types = config.getAllNodeTypes();

    this.nodes.push(new FlowNode(types[0], 0,   300));
    this.nodes.push(new FlowNode(types[1], 300, 0));
    this.nodes.push(new FlowNode(types[2], 600, 300));
    this.nodes.push(new FlowNode(types[3], 300, 600));

    this.edges.push(new FlowEdge(this.nodes[0], this.nodes[1], FlowEdge.FORWARD));
    this.edges.push(new FlowEdge(this.nodes[1], this.nodes[2], FlowEdge.FORWARD));
    this.edges.push(new FlowEdge(this.nodes[2], this.nodes[3], FlowEdge.BACKWARD));
    this.edges.push(new FlowEdge(this.nodes[3], this.nodes[0], FlowEdge.BACKWARD));
    this.edges.push(new FlowEdge(this.nodes[0], this.nodes[2], FlowEdge.BOTH));
    this.edges.push(new FlowEdge(this.nodes[1], this.nodes[3], FlowEdge.NONE));

    console.log(this.nodes);
    console.log(this.edges);

    this.renderer.SetNodeListRef(this.nodes);
    this.renderer.SetEdgeListRef(this.edges);
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

/**
 * Removes the specified node from the graph and triggers a Renderer update.
 *
 * @param {FlowNode}  node   The node to be removed.
 */
GraphManager.prototype.RemoveNode = function(node) {
    var index = this.nodes.indexOf(node);
    if (index > -1) {
        this.nodes.splice(index, 1);
    }
    this.renderer.Update();
};