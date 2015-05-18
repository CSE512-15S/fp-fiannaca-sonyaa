//Private
var Inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

var FlowNode = require('../modules/FlowNode');
var FlowEdge = require('../modules/FlowEdge');

Inherits(Renderer, EventEmitter);

var DrawLine = d3.svg.line()
    .x(function(d) {return d.x;})
    .y(function(d) {return d.y;})
    .interpolate('linear');

function DrawPath(d, i) {
    d3.select('path#flow-edge-path-' + i)
        .attr('d', function(d) {return DrawLine(d.getPath());})
        .attr('class', 'flow-edge-path');
}

function DrawArrow(d, i) {
    if(d.direction === FlowEdge.FORWARD || d.direction === FlowEdge.BOTH) {
        d3.select('g#flow-edge-tip-' + i)
            .append('path')
            .attr('d', function(d) {return DrawLine(d.getTip(FlowEdge.FORWARD));})
            .attr('class', 'flow-edge-tip');
    }

    if(d.direction === FlowEdge.BACKWARD || d.direction === FlowEdge.BOTH) {
        d3.select('g#flow-edge-tip-' + i)
            .append('path')
            .attr('d', function(d) {return DrawLine(d.getTip(FlowEdge.BACKWARD));})
            .attr('class', 'flow-edge-tip');

    }
}

//Public Interface
module.exports = Renderer;

//Constructor
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

    //Temp section - remove this after the AddNode module is ready to go
    this.n = [];
    this.e = [];

    var types = this.config.getAllNodeTypes();

    this.n.push(new FlowNode(types[0], 0,   300));
    this.n.push(new FlowNode(types[1], 300, 0));
    this.n.push(new FlowNode(types[2], 600, 300));
    this.n.push(new FlowNode(types[3], 300, 600));

    this.e.push(new FlowEdge(this.n[0], this.n[1], FlowEdge.FORWARD));
    this.e.push(new FlowEdge(this.n[1], this.n[2], FlowEdge.FORWARD));
    this.e.push(new FlowEdge(this.n[2], this.n[3], FlowEdge.BACKWARD));
    this.e.push(new FlowEdge(this.n[3], this.n[0], FlowEdge.BACKWARD));
    this.e.push(new FlowEdge(this.n[0], this.n[2], FlowEdge.BOTH));
    this.e.push(new FlowEdge(this.n[1], this.n[3], FlowEdge.NONE));

    console.log(this.n);
    console.log(this.e);

    //TODO: Think about how we condense edges when the user specifies both a FORWARD and BACKWARD edge between the
    //      same nodes
}

Renderer.prototype.SetNodeListRef = function(list) {
    this.n = list;
};

Renderer.prototype.SetEdgeListRef = function(list) {
    this.e = list;
};

Renderer.prototype.Update = function() {
    var edgeUpdate = this.edges
        .selectAll('g')
        .data(this.e);

    edgeUpdate.selectAll('path.flow-edge')
        .attr('id', function(d, i) {return 'flow-path-' + i;})
        .each(function(d, i) {
            d3.select('path#flow-path-' + i)
                .attr('d', function(d) {return DrawLine(d.getPath());});
        });

    edgeUpdate.selectAll('path.flow-edge-tip')
        .attr('id', function(d, i) {return 'flow-path-tip-' + i;})
        .each(function(d, i) {
            d3.select('path#flow-path-tip-' + i)
                .attr('d', function(d) {return DrawLine(d.getTipPath());});
        });

    // Enter Set
    var arrow = edgeUpdate.enter()
        .append('g')
        .attr('class', 'flow-edge');

    arrow.append('path')
        .attr('id', function(d, i) {return 'flow-edge-path-' + i;})
        .each(DrawPath);

    arrow.append('g')
        .attr('id', function(d, i) {return 'flow-edge-tip-' + i;})
        .each(DrawArrow);

    this.nodes.data(this.n);
};
