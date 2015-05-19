//Private
var Inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

var FlowNode = require('../modules/FlowNode');
var FlowEdge = require('../modules/FlowEdge');

Inherits(Renderer, EventEmitter);

function DrawNode(d, i) {
    var s = Snap('g#flow-node-' + i);

    s.append(d.type.getSvg());
}

/**
 * d3 utility for creating SVG paths from an array of points. This is used to generate the edges.
 */
var DrawLine = d3.svg.line()
    .x(function(d) {return d.x;})
    .y(function(d) {return d.y;})
    .interpolate('linear');

/**
 * Draws the path of an edge between two nodes.
 *
 * @param {object}  d    d3 data object
 * @param {object}  i    d3 data object index
 */
function DrawEdgePath(d, i) {
    d3.select('path#flow-edge-path-' + i)
        .attr('d', DrawLine(d.getPath()))
        .attr('class', 'flow-edge-path');
}

/**
 * Draws the tips on an edge. This could either be arrow heads in the forward and/or backward directions, or dots
 * indicating no direction.
 *
 * @param {object}  d   d3 data object
 * @param {object}  i   d3 data object index
 */
function DrawEdgeTips(d, i) {
    if(d.direction === FlowEdge.FORWARD || d.direction === FlowEdge.BOTH) {
        d3.select('g#flow-edge-tip-' + i)
            .append('path')
            .attr('d', DrawLine(d.getForwardTip()))
            .attr('class', 'flow-edge-tip forward');
    }

    if(d.direction === FlowEdge.BACKWARD || d.direction === FlowEdge.BOTH) {
        d3.select('g#flow-edge-tip-' + i)
            .append('path')
            .attr('d', DrawLine(d.getBackwardTip()))
            .attr('class', 'flow-edge-tip backward');
    }

    if(d.direction === FlowEdge.NONE) {
        var tips = d3.select('g#flow-edge-tip-' + i);

        tips.append('circle')
            .attr('cx', d.startPt.x)
            .attr('cy', d.startPt.y)
            .attr('r', 5)
            .attr('class', 'flow-edge-tip-dot start');

        tips.append('circle')
            .attr('cx', d.endPt.x)
            .attr('cy', d.endPt.y)
            .attr('r', 5)
            .attr('class', 'flow-edge-tip-dot end');
    }
}

/**
 * Updates all of the edges in the update set.
 *
 * @param {Array}   updateSet   A d3 selection of all of the edges in the edge layer
 */
function UpdateEdges(updateSet) {
    // Update edge paths
    updateSet.selectAll('path.flow-edge-path')
        .attr('d', function(d) {return DrawLine(d.getPath());});

    // Update forward tips
    updateSet.selectAll('g g path.forward')
        .attr('d', function(d) {return DrawLine(d.getForwardTip());});

    // Update backward tips
    updateSet.selectAll('g g path.backward')
        .attr('d', function(d) {return DrawLine(d.getBackwardTip());});

    // Update start dots
    updateSet.selectAll('g g circle.start')
        .attr('cx', function(d) {return d.startPt.x;})
        .attr('cy', function(d) {return d.startPt.y;});

    // Update end dots
    updateSet.selectAll('g g circle.end')
        .attr('cx', function(d) {return d.endPt.x;})
        .attr('cy', function(d) {return d.endPt.y;});
}

//Public Interface
module.exports = Renderer;

/**
 * The Renderer module is responsible for rendering to the screen the list of nodes and edges provided by the
 * GraphManager module.
 *
 * @param {object}          viz     A d3 selection for the root node of the visualization
 * @param {ConfigParser}    config  The config parser object
 *
 * @constructor Sets parameters and creates layers for the edges (at the bottom) and the nodes(at the top)
 */
function Renderer(viz, config) {
    this.viz = viz;
    this.config = config;

    //Draw the edge layer below the node layer
    this.edges = this.viz.append('g')
        .attr('id', 'edge-group');

    this.nodes = this.viz.append('g')
        .attr('id', 'node-group');

    //Objects for referencing the node and edge lists
    this.n = null;
    this.e = null;

    //TODO: Remove this test code after debugging...

    var that = this;
    $(document).on('click', function() {
        console.log('Moving a node...');

        //Change the node's placement
        that.n[0].x = 0;
        that.n[0].y = 0;

        //Update the edges
        that.e[0].Update();
        that.e[3].Update();
        that.e[4].Update();

        //Redraw
        that.Update();

        $(document).off('click');

        $(document).on('click', function() {
            console.log('Removing edges...');

            that.e.pop();
            that.e.pop();

            that.Update();

            $(document).off('click');
        });
    });

    //TODO: Think about how we condense edges when the user specifies both a FORWARD and BACKWARD edge between the same nodes
}

/**
 * Sets this object's reference to the GraphManager's list of nodes. This should only be called once: in the
 * GraphManager's constructor!
 *
 * @param {object}  list    A list of the nodes
 */
Renderer.prototype.SetNodeListRef = function(list) {
    this.n = list;
};

/**
 * Sets this object's reference to the GraphManager's list of edges. This should only be called once: in the
 * GraphManager's constructor!
 *
 * @param {object}  list    A list of the edges
 */
Renderer.prototype.SetEdgeListRef = function(list) {
    this.e = list;
};

/**
 * Updates, create, and removes edges.
 */
Renderer.prototype.UpdateEdges = function() {
    // Get the update set
    var edges = this.edges
        .selectAll('g.flow-edge')
        .data(this.e);

    // Run updates
    UpdateEdges(edges);

    // Exit set
    edges.exit().remove();

    // Enter Set
    var arrow = edges.enter()
        .append('g')
        .attr('class', 'flow-edge');

    arrow.append('path')
        .attr('id', function(d, i) {return 'flow-edge-path-' + i;})
        .each(DrawEdgePath);

    arrow.append('g')
        .attr('id', function(d, i) {return 'flow-edge-tip-' + i;})
        .each(DrawEdgeTips);
};

Renderer.prototype.UpdateNodes = function() {
    // Get the update set
    var nodes = this.nodes
        .selectAll('g.flow-node')
        .data(this.n);

    nodes.attr('transform', function(d) {return 'translate(' + d.x + ',' + d.y + ')';});

    // Enter Set
    var node = nodes.enter()
        .append('g')
        .attr('class', 'flow-node')
        .attr('id', function(d, i) {return 'flow-node-' + i;})
        .attr('transform', function(d) {return 'translate(' + d.x + ',' + d.y + ')';})
        .attr('width', 80)
        .attr('height', 80)
        .each(DrawNode);

};

/**
 * The main rendering function. This function renders the graph to the screen and updates the previously rendered
 * version of the graph.
 */
Renderer.prototype.Update = function() {
    this.UpdateEdges();
    this.UpdateNodes();

    //For debugging until rendering of nodes is implemented
    //for (var i = 0; i < this.n.length; i++) {
    //    console.log(this.n[i].x + ' ' + this.n[i].y);
    //}
};
