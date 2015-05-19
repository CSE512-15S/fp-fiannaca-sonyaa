//Private
var Inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

Inherits(Layout, EventEmitter);

// Public
module.exports = Layout;

/**
 * The Layout module is responsible for laying out nodes in the graph.
 *
 * @param {ConfigParser}  config    A reference to the ConfigParser object
 *
 * @constructor Sets parameters
 */
function Layout(config) {
    this.config = config;
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
    if (this.config.layout == "right") {
        return [xMinAvgMax.max+indent, yMinAvgMax.avg];
    } else if (this.config.layout == "left") {
        return [xMinAvgMax.min-indent, yMinAvgMax.avg];
    } else if (this.config.layout == "top") {
        return [xMinAvgMax.avg, yMinAvgMax.max + indent];
    } else if (this.config.layout == "bottom") {
        return [xMinAvgMax.avg, yMinAvgMax.min - indent];
    } else {
        console.log('Unknown layout type.');
        return [0, 0];
    }
};