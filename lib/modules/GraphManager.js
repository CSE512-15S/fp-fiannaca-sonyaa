var _ = require('lodash');

var FlowNode = require('../modules/FlowNode');
var FlowEdge = require('../modules/FlowEdge');
var NodeType = require('../modules/NodeType');

var fv = null;

module.exports = GraphManager;

/**
 * The GraphManager module is responsible for keeping track of the nodes and edges in the visualization.
 *
 * @param {Renderer}    renderer    The renderer object
 * @param {Layout}      layout      The layout object
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

    var width = $(fv.Selector).width();
    var height = $(fv.Selector).height();

    var nodeW = (d.type.width * d.type.scale);
    var nodeH = (d.type.height * d.type.scale);

    x = x >= 0 ? x : 0;
    y = y >= 0 ? y : 0;

    x = (x + nodeW) <= width ? x : (width - nodeW);
    y = (y + nodeH) <= height ? y : (height - nodeH);

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

    var newNode = new FlowNode(type, x, y);
    this.nodes.push(newNode);

    if(fv.DebugMode) console.log("Node added");
    if(update === true) fv.Renderer.Update();

    fv.emit('node-added', newNode);

    return newNode;
};

/**
 * Creates a new node of specified type and adds it to the main visualization, triggering a Renderer update.
 * The coordinates for the new node are obtained from the Layout module.
 *
 * @param {NodeType}  type    Type of a node to be created
 */
GraphManager.prototype.AddNodeAutoLayout = function(type) {
    var coords = fv.Layout.GetNewNodeCoords(this.nodes);
    return this.AddNode(type, coords[0], coords[1]);
};

/**
 * Removes the specified node from the graph and triggers a Renderer update.
 *
 * @param {FlowNode}  node   The node to be removed.
 */
GraphManager.prototype.RemoveNode = function(node) {
    // This look convoluted, but all it is is removing edges in place rather than creating a new array
    var index = _.findIndex(this.edges, function(edge) {
        return edge.start === node || edge.end === node;
    });

    while(index >= 0) {
        _.pullAt(this.edges, index);

        index = _.findIndex(this.edges, function(edge) {
            return edge.start === node || edge.end === node;
        });
    }

    _.pull(this.nodes, node);

    fv.Renderer.Update();

    fv.emit('node-removed', node);
    return node;
};

/**
 * Removes the specified edge from the graph and triggers a Renderer update.
 *
 * @param {FlowEdge}  edge   The edge to be removed.
 */
GraphManager.prototype.RemoveEdge = function(edge) {
    _.pull(this.edges, edge);

    if(edge.direction !== FlowEdge.STD) {
        _.forEach(this.edges, function (e) {
            if (e.start === edge.end && e.end === edge.start) {
                e.direction = FlowEdge.STD;
                e.Update();
                fv.Renderer.RedrawEdges();
            }
        });
    }

    fv.Renderer.Update();

    fv.emit('edge-removed', edge);
    return edge;
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

    var msg = "";

    if(end === null || start === null) {
        console.error("I can't add an edge if one of the nodes is NULL!");
        return dontAddEdge;
    }

    if(start === end) {
        msg = "Self-loops are not allowed";
        fv.ShowWarning(msg);
        console.error(msg);
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

    if(!fv.ConstraintChecker.IsValidEdge(start, end, this.edges)) {
        console.error("This edge does not satisfy constraints!");
        return dontAddEdge;
    }

    dir = FlowEdge.STD;
    var addEdge = true;
    _.forEach(this.edges, function(edge) {
        if(edge.start === start && edge.end === end) {
            msg = "No edges will be added since this edge already exists!";
            fv.ShowWarning(msg);
            console.error(msg);

            addEdge = false;
            return false;
        }
        if(edge.start === end && edge.end === start) {
            edge.direction = FlowEdge.FORWARD;
            edge.Update();

            dir = FlowEdge.BACKWARD;
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

    if(dir === FlowEdge.BACKWARD) {
        var tmp = start;
        start = end;
        end = tmp;
    }

    var edgeDir = this.CheckNewEdge(start, end, dir);

    if(edgeDir >= 0) {

        if(fv.DebugMode) console.log("Edge added");

        var newEdge = new FlowEdge(start, end, edgeDir);
        this.edges.push(newEdge);

        if(update === true) fv.Renderer.Update();

        fv.emit('edge-added', newEdge);

        return newEdge;
    }

    return null;
};

GraphManager.prototype.Save = function(filename) {
    if(filename === undefined) {
        filename = "default.json";
    }

    var jsonEdges = [];
    var jsonNodes = [];
    var jsonTypes = [];

    var types = fv.Config.getAllNodeTypes();

    _.forEach(types, function(type) {
        jsonTypes.push(type.getJSON());
    });

    _.forEach(this.nodes, function(node) {
        jsonNodes.push(node.getJSON());
    });

    _.forEach(this.edges, function(edge) {
        jsonEdges.push(edge.getJSON());
    });

    var url = 'data:text/json;charset=utf8,' + JSON.stringify({
            "filename": filename,
            "types": jsonTypes,
            "nodes": jsonNodes,
            "edges": jsonEdges
        });
    window.open(url, '_blank');
    window.focus();
};

/**
 * For every node in the graph, checks if it has exactly one required incoming node, then creates that node and
 * the corresponding edge.
 *
 * @param {boolean}     [doLayout=true]   Indicates if the auto layout should be performed after the creation of new edges.
 * @return {boolean} Returns true if anything new was created.
 */
GraphManager.prototype.AutoCompleteIncoming = function(doLayout) {
    if(doLayout === undefined) {
        doLayout = true;
    }
    var hasNew = false;
    if (doLayout) {
        fv.Layout.AutoLayout(this.nodes, this.edges);
        fv.Renderer.Update();
    }
    return hasNew;
};

/**
 * For every node in the graph, checks if it has exactly one required outgoing node, then creates that node and
 * the corresponding edge.
 *
 * @param {boolean}     [doLayout=true]   Indicates if the auto layout should be performed after the creation of new edges.
 * @return {boolean} Returns true if anything new was created.
 */
GraphManager.prototype.AutoCompleteOutgoing = function(doLayout) {
    if(doLayout === undefined) {
        doLayout = true;
    }
    var hasNew = false;
    _.forEach(this.nodes, function(n) {
        var neighbors = fv.ConstraintChecker.GetRequiredTypes(n, fv.GraphManager.edges, true);
        if (neighbors.length == 1) {
            var newNode = fv.GraphManager.AddNodeAutoLayout(neighbors[0]);
            fv.GraphManager.AddEdge(n, newNode, FlowEdge.FORWARD);
            hasNew = true;
        }

    });
    if (doLayout) {
        fv.Layout.AutoLayout(this.nodes, this.edges);
        fv.Renderer.Update();
    }
    return hasNew;
};

/**
 * For every node in the graph, checks if it has exactly one required incoming or outgoing node, then creates that node and
 * the corresponding edge.
 *
 * @param {boolean}     [doLayout=true]   Indicates if the auto layout should be performed after the creation of new edges.
 * @return {boolean} Returns true if anything new was created.
 */
GraphManager.prototype.AutoCompleteAll = function(doLayout) {
    var that = this;
    if(doLayout === undefined) {
        doLayout = true;
    }
    var hasNew = this.AutoCompleteIncoming(false);
    _.forEach(this.nodes, function(n) {
        var neighbors = fv.ConstraintChecker.GetRequiredTypes(n, fv.GraphManager.edges, false);
        if (neighbors.length == 1) {
            var newNode = fv.GraphManager.AddNodeAutoLayout(neighbors[0]);
            fv.GraphManager.AddEdge(newNode, n, FlowEdge.FORWARD);
            hasNew = true;
        }

    });
    hasNew = hasNew || this.AutoCompleteOutgoing(false);
    if (doLayout) {
        fv.Layout.AutoLayout(fv.GraphManager.nodes, fv.GraphManager.edges);
        fv.Renderer.Update();
    }
    return hasNew;
};