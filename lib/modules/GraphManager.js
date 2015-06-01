//Private
var Inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');

var FlowNode = require('../modules/FlowNode');
var FlowEdge = require('../modules/FlowEdge');
var NodeType = require('../modules/NodeType');

var fv = null;

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
function GraphManager(flowviz) {
    fv = flowviz;

    this.nodes = [];
    this.edges = [];

    this.tmpNode = null;
    this.tmpEdge = null;

    fv.Renderer.SetNodeListRef(this.nodes);
    fv.Renderer.SetEdgeListRef(this.edges);

    // TODO: Remove the testing code below after debugging
    
    var types = fv.Config.getAllNodeTypes();

    this.AddNode(types[0], 10, 310, false);
    this.AddNode(types[1], 310, 10, false);
    this.AddNode(types[2], 610, 310, false);
    this.AddNode(types[3], 310, 610);

    this.nodes[0].SetDataItem('SomeNumber', 19);

    this.AddEdge(this.nodes[0], this.nodes[1], FlowEdge.FORWARD, false);
    this.AddEdge(this.nodes[1], this.nodes[2], FlowEdge.FORWARD, false);
    this.AddEdge(this.nodes[2], this.nodes[3], FlowEdge.BACKWARD, false);
    this.AddEdge(this.nodes[3], this.nodes[0], FlowEdge.BACKWARD);

    //this.AddEdge(this.nodes[0], this.nodes[2], FlowEdge.BOTH, false);
    //this.AddEdge(this.nodes[1], this.nodes[3], FlowEdge.NONE);
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

        _.forEach(this.edges, function(edge) {
            if(edge.start === moving || edge.end === moving) {
                edge.Update();
            }
        });

        fv.Renderer.Update();
    }
};

/**
 * Creates a new node of specified type and adds it to the main visualization, triggering a Renderer update.
 *
 * @param {NodeType}    type            Type of a node to be created
 * @param {number}      x               The initial X position of this node in the visualization.
 * @param {number}      y               The initial Y position of this node in the visualization.
 * @param {boolean}     [update=true]   Flag to indicate if the Renderer.Update should be called after adding the node
 */
GraphManager.prototype.AddNode = function(type, x, y, update) {
    if(update === undefined) {
        update = true;
    }

    if(fv.DebugMode) console.log("Node added");

    this.nodes.push(new FlowNode(type, x, y));

    if(update === true) fv.Renderer.Update();
};

/**
 * Creates a new node of specified type and adds it to the main visualization, triggering a Renderer update.
 * The coordinates for the new node are obtained from the Layout module.
 *
 * @param {NodeType}  type    Type of a node to be created
 */
GraphManager.prototype.AddNodeAutoLayout = function(type) {
    var coords = fv.Layout.GetNewNodeCoords(this.nodes);
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
    fv.Renderer.Update();
};

/**
 * Removes the specified edge from the graph and triggers a Renderer update.
 *
 * @param {FlowEdge}  edge   The edge to be removed.
 */
GraphManager.prototype.RemoveEdge = function(edge) {
    var index = this.edges.indexOf(edge);
    if (index > -1) {
        this.edges.splice(index, 1);
    }
    fv.Renderer.Update();
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

    this.tmpNode = new FlowNode(NodeType.GetDummy(), x, y);
    this.tmpEdge = new FlowEdge(node, this.tmpNode, FlowEdge.FORWARD);

    fv.Renderer.DrawConnection(this.tmpNode, this.tmpEdge);
};

/**
 * Completes the process of adding a new edge to the graph.
 *
 * @param {FlowNode}    node    The end node to connect to
 */
GraphManager.prototype.EndConnection = function(node) {
    // Attempt to add the edge
    this.AddEdge(this.tmpEdge.start, node, FlowEdge.FORWARD, false);

    // Reset the temp node display
    this.tmpNode = null;
    this.tmpEdge = null;
    fv.Renderer.RemoveTempParts();

    // Update the viz
    fv.Renderer.Update();
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

    if(end === null || start === null) {
        console.error("I can't add an edge if one of the nodes is NULL!");
        return dontAddEdge;
    }

    if(start === end) {
        console.error("I can't add a self edge!");
        return dontAddEdge;
    }

    if($.inArray(start, this.nodes) < 0) {
        console.error("I can't add an edge if I don't already know the start node!");
        return dontAddEdge;
    }

    if(!$.inArray(end, this.nodes) < 0) {
        console.error("I can't add an edge if I don't already know the end node!");
        return dontAddEdge;
    }

    var addEdge = true;
    _.forEach(this.edges, function(edge) {
        if(edge.start === start && edge.end === end) {
            if(edge.direction === FlowEdge.FORWARD && dir === FlowEdge.BACKWARD ||
                edge.direction === FlowEdge.BACKWARD && dir === FlowEdge.FORWARD ) {

                edge.direction = FlowEdge.BOTH;
                fv.Renderer.RedrawEdges();

                console.warn("This edge already exists. I only changed the edge's direction.");
            } else {
                console.warn("No edges will be added since this edge already exists!");
            }

            addEdge = false;
            return false;
        }
        if(edge.start === end && edge.end === start) {

            if(edge.direction === FlowEdge.BACKWARD && dir === FlowEdge.BACKWARD ||
                edge.direction === FlowEdge.FORWARD && dir === FlowEdge.FORWARD ) {

                edge.direction = FlowEdge.BOTH;
                fv.Renderer.RedrawEdges();

                console.warn("This edge already exists. I only changed the edge's direction.");
            } else {
                console.warn("No edges will be added since this edge already exists!");
            }

            addEdge = false;
            return false;
        }
    });

    if(!addEdge) return dontAddEdge;

    return dir;
};

/**
 * Adds a new edge to the graph. Uses CheckNewEdge to verify if the edge should be added or if an existing edge should
 * have its tips changed.
 *
 * @param {FlowNode}    start           The start node
 * @param {FlowNode}    end             The end node
 * @param {number}      dir             The direction of the edge
 * @param {boolean}     [update=true]   Indicates if Renderer.Update() should be called after adding the edge
 */
GraphManager.prototype.AddEdge = function(start, end, dir, update) {
    if(update === undefined) {
        update = true;
    }

    var edgeDir = this.CheckNewEdge(start, end, dir);

    if(edgeDir >= 0) {

        if(fv.DebugMode) console.log("Edge added");

        this.edges.push(new FlowEdge(start, end, edgeDir));
        if(update === true) fv.Renderer.Update();
    }
};