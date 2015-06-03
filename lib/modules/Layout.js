var fv = null;

module.exports = Layout;

/**
 * The Layout module is responsible for laying out nodes in the graph.
 *
 * @param {FlowViz}  flowviz    A reference to the top level FlowViz object
 *
 * @constructor Sets parameters
 */
function Layout(flowviz) {
    fv = flowviz;
}

/**
 * Returns the coordinates for a new node.
 *
 * @param {object}  nodes    A list of existing nodes in the graph.
 *
 * @return {object} A list of x,y coordinates.
 */
Layout.prototype.GetNewNodeCoords = function(nodes) {
    // TODO: indent should be a config parameter or should depend on node size ?
    var indent = 100;
    var xMinAvgMax = {"min": 0, "avg": 0, "max": 0};
    var yMinAvgMax = {"min": 0, "avg": 0, "max": 0};
    for (var i = 0; i < nodes.length; i++) {
        xMinAvgMax.min = Math.min(xMinAvgMax.min, nodes[i].x);
        xMinAvgMax.avg += nodes[i].x/nodes.length;
        xMinAvgMax.max = Math.max(xMinAvgMax.max, nodes[i].x);
        yMinAvgMax.min = Math.min(yMinAvgMax.min, nodes[i].y);
        yMinAvgMax.avg += nodes[i].y/nodes.length;
        yMinAvgMax.max = Math.max(yMinAvgMax.max, nodes[i].y);
    }
    // TODO make layout type an enum
    if (fv.Config.layout === "right") {
        return [xMinAvgMax.max+indent, yMinAvgMax.avg];
    } else if (fv.Config.layout === "left") {
        return [xMinAvgMax.min-indent, yMinAvgMax.avg];
    } else if (fv.Config.layout === "top") {
        return [xMinAvgMax.avg, yMinAvgMax.max + indent];
    } else if (fv.Config.layout === "bottom") {
        return [xMinAvgMax.avg, yMinAvgMax.min - indent];
    } else {
        console.log('Unknown layout type.');
        return [0, 0];
    }
};

/**
 * Sets the (x,y) coordinates for all the given nodes using Dagre layout library.
 *
 * @param {object}  nodes    A list of nodes in the graph.
 * @param {object}  edges    A list of edges in the graph.
 */
Layout.prototype.SetDagreLayoutCoordinates = function(nodes, edges) {
    var g = new dagre.graphlib.Graph();
    g.setGraph({});
    g.setDefaultEdgeLabel(function() { return {}; });
    var ids = {};
    for (var i = 0; i < nodes.length; i++) {
        var width = 100;
        var height = 100;
        g.setNode(nodes[i].id, {label: nodes[i].id, width: width, height: height});
    }
    for (var j = 0; j < edges.length; j++) {
        g.setEdge(edges[j].start.id, edges[j].end.id);
    }
    dagre.layout(g);
    for (i = 0; i < nodes.length; i++) {
        nodes[i].x = g.node(nodes[i].id).x;
        nodes[i].y = g.node(nodes[i].id).y;
    }
};