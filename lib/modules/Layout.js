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
    if (fv.Config.layout === "vertical") {
        // If graph is layout vertically, add new node on the right.
        return [xMinAvgMax.max + indent, yMinAvgMax.avg];
    } else if (fv.Config.layout === "horizontal") {
        // If graph is layout horizontally, add new node on the bottom.
        return [xMinAvgMax.avg, yMinAvgMax.max + indent];
    } else {
        console.warn('Unknown layout type.');
        return [0, 0];
    }
};

/**
 * Sets the (x,y) coordinates for all the given nodes using Dagre layout library.
 *
 * @param {object}  nodes    A list of nodes in the graph.
 * @param {object}  edges    A list of edges in the graph.
 */
Layout.prototype.AutoLayout = function(nodes, edges) {
    var g = new dagre.graphlib.Graph();
    var dagreProperties = {};
    if (fv.Config.layout === "vertical") {
        dagreProperties["rankdir"] = "TB";
    } else if (fv.Config.layout === "horizontal") {
        dagreProperties["rankdir"] = "LR";
    } else {
        console.warn('Unknown layout type.');
    }
    g.setGraph(dagreProperties);
    g.setDefaultEdgeLabel(function() { return {}; });
    var ids = {};
    for (var i = 0; i < nodes.length; i++) {
        var width = 100;
        var height = 100;
        ids[nodes[i]] = i;
        nodes[i].id = i;
        g.setNode(i, {label: i, width: width, height: height});
    }
    for (var j = 0; j < edges.length; j++) {
        //g.setEdge(ids[edges[j].start], ids[edges[j].end]);
        g.setEdge(edges[j].start.id, edges[j].end.id);
    }
    dagre.layout(g);
    for (i = 0; i < nodes.length; i++) {
        nodes[i].x = g.node(nodes[i].id).x;
        nodes[i].y = g.node(nodes[i].id).y;
    }
    for (i = 0; i < edges.length; i++) {
        edges[i].Update();
        //edges[i].points = g.edge(edges[i].start.id, edges[i].end.id).points;
    }
};