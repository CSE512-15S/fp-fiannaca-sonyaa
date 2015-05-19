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
 * @constructor Sets parameters and passes references to node and edge lists to renderer.
 */
function GraphManager(renderer, layout, config) {
    this.renderer = renderer;
    this.layout = layout;

    this.nodes = [];
    this.edges = [];

    this.tmpNode = null;
    this.tmpEdge = null;

    this.renderer.SetNodeListRef(this.nodes);
    this.renderer.SetEdgeListRef(this.edges);

    // TODO: Remove the testing code below after debugging
    
    var types = config.getAllNodeTypes();

    // TODO: Maybe hold off on rendering when we are doing bulk inserts at the beginning here?

    this.AddNode(types[0], 0, 300);
    this.AddNode(types[1], 300, 0);
    this.AddNode(types[2], 600, 300);
    this.AddNode(types[3], 300, 600);

    this.edges.push(new FlowEdge(this.nodes[0], this.nodes[1], FlowEdge.FORWARD));
    this.edges.push(new FlowEdge(this.nodes[1], this.nodes[2], FlowEdge.FORWARD));
    this.edges.push(new FlowEdge(this.nodes[2], this.nodes[3], FlowEdge.BACKWARD));
    this.edges.push(new FlowEdge(this.nodes[3], this.nodes[0], FlowEdge.BACKWARD));

    //this.edges.push(new FlowEdge(this.nodes[0], this.nodes[2], FlowEdge.BOTH));
    //this.edges.push(new FlowEdge(this.nodes[1], this.nodes[3], FlowEdge.NONE));
}

/**
 * Moves a node to the provided location and updates any edges connected to the node. This function triggers an update
 * on the Renderer.
 *
 * @param {FlowNode}    d   The node to move
 * @param {Number}      x   The new x position of the node
 * @param {Number}      y   The new y position of the node
 */
GraphManager.prototype.MoveNode = function(d, x, y) {
    var index;
    if((index = $.inArray(d, this.nodes)) >= 0) {
        var moving = this.nodes[index];

        moving.x = x;
        moving.y = y;

        for(var i in this.edges) {
            if(this.edges.hasOwnProperty(i)) {
                if(this.edges[i].start === moving || this.edges[i].end === moving) {
                    this.edges[i].Update();
                }
            }
        }

        this.renderer.Update();
    }
};

/**
 * Creates a new node of specified type and adds it to the main visualization, triggering a Renderer update.
 *
 * @param {NodeType}  type    Type of a node to be created
 * @param {Number}      x           The initial X position of this node in the visualization.
 * @param {Number}      y           The initial Y position of this node in the visualization.
 */
GraphManager.prototype.AddNode = function(type, x, y) {
    this.nodes.push(new FlowNode(type, x, y, this));
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
    this.AddNode(type, coords[0], coords[1], this);
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

/**
 * Starts the process of creating a new connection between nodes in the graph by creating a temporary edge and node.
 *
 * @param {FlowNode}    node    The node from which the edge starts
 * @param {number}      x       The starting x position of the end of the temp edge
 * @param {number}      y       The starting y position of the end of the temp edge
 */
GraphManager.prototype.StartConnection = function(node, x, y) {
    console.log("Starting connection");

    this.tmpNode = new FlowNode(null, x, y, this, true);
    this.tmpEdge = new FlowEdge(node, this.tmpNode, FlowEdge.FORWARD, true);

    this.renderer.DrawConnection(this.tmpNode, this.tmpEdge);
};

/**
 * Completes the process of adding a new edge to the graph.
 *
 * @param {FlowNode}    node    The end node to connect to
 */
GraphManager.prototype.EndConnection = function(node) {
    if(node === this.tmpEdge.start || node === null) {
        console.log('Cancelling connection');
    } else {
        console.log("Ending connection");

        var edgeDir = this.CheckNewEdge(this.tmpEdge.start, node, FlowEdge.FORWARD);
        console.log('Edge dir: ' + edgeDir);
        if(edgeDir >= 0) {
            this.edges.push(new FlowEdge(this.tmpEdge.start, node, edgeDir));
        }
    }

    // Reset the temp node display
    this.tmpNode = null;
    this.tmpEdge = null;
    this.renderer.RemoveTempParts();

    // Update the viz
    this.renderer.Update();
};

/**
 * When adding a new edge it is possible that the new edge is drawn over an existing edge. In this case, this function
 * checks to see if the direction of the edge needs to be updated.
 *
 * @param {FlowNode}    start   The start node of the new edge
 * @param {FlowNode}    end     The end node of the new edge
 * @param {number}      dir     The direction of the new edge
 * @returns {number}    Indicates the direction of the new edge. (-1) if the new edge should not be added to the list of edges.
 */
GraphManager.prototype.CheckNewEdge = function(start, end, dir) {
    var dontAddEdge = -1;

    if($.inArray(start, this.nodes) < 0) return dontAddEdge;

    if(!$.inArray(end, this.nodes) < 0) return dontAddEdge;

    for(var e in this.edges) {
        if(this.edges.hasOwnProperty(e)) {
            if(this.edges[e].start === start && this.edges[e].end === end) {
                if(this.edges[e].direction === FlowEdge.FORWARD && dir === FlowEdge.BACKWARD ||
                    this.edges[e].direction === FlowEdge.BACKWARD && dir === FlowEdge.FORWARD ) {

                    this.edges[e].direction = FlowEdge.BOTH;
                    this.renderer.RedrawEdges();
                }

                return dontAddEdge;
            }
            if(this.edges[e].start === end && this.edges[e].end === start) {

                if(this.edges[e].direction === FlowEdge.BACKWARD && dir === FlowEdge.BACKWARD ||
                    this.edges[e].direction === FlowEdge.FORWARD && dir === FlowEdge.FORWARD ) {

                    this.edges[e].direction = FlowEdge.BOTH;
                    this.renderer.RedrawEdges();
                }

                return dontAddEdge;
            }
        }
    }

    return dir;
};