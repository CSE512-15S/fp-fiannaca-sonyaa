//Private
var offset = 30;
var arrHeight = 25;
var arrWidth = 10;


//Public
module.exports = FlowEdge;

// Possible edge directions
module.exports.FORWARD = 0;
module.exports.BACKWARD = 1;
module.exports.BOTH = 2;
module.exports.NONE = 3;

/**
 * Defines the FlowEdge type. This encapsulates an edge between nodes in the FlowViz graph.
 *
 * @param start (FlowNode) The node from which the edge starts
 * @param end (FlowNode) The node to which the edge ends
 * @param direction Flag indicating the direction in which arrows should be drawn on this edge
 * @constructor Calculates the points of the start and end of the edge.
 */
function FlowEdge(start, end, direction) {
    this.start = start;
    this.end = end;
    this.direction = direction;

    if(direction < module.exports.FORWARD || direction > module.exports.NONE) {
        throw new Error("Direction must be one of FlowEdge.{FORWARD, BACKWARD, BOTH, or NONE}");
    }

    var denom =  Math.sqrt(Math.pow(this.end.x - this.start.x,2) + Math.pow(this.end.y - this.start.y,2));

    this.dx = ((this.end.x - this.start.x) / denom);
    this.dy = ((this.end.y - this.start.y) / denom);

    this.startPt = {
        x: this.start.x + offset * this.dx,
        y: this.start.y + offset * this.dy
    };
    this.endPt = {
        x: this.end.x - offset * this.dx,
        y: this.end.y - offset * this.dy
    };
}

/**
 * Creates a list of points that constitute the path of the body of the edge.
 *
 * @returns {*[]} Points along which to draw the edge
 */
FlowEdge.prototype.getPath = function() {
    return [this.startPt, this.endPt];
};

/**
 * Returns the path for drawing the forward facing arrow head.
 *
 * @returns {*[]} path of the forward facing arrow head
 */
FlowEdge.prototype.getForwardTip = function() {
    var insetX = this.endPt.x - arrHeight * this.dx;
    var insetY = this.endPt.y - arrHeight * this.dy;

    return [{
        x: insetX + this.dy * arrWidth,
        y: insetY - this.dx * arrWidth
    }, {
        x: this.endPt.x,
        y: this.endPt.y
    }, {
        x: insetX - this.dy * arrWidth,
        y: insetY + this.dx * arrWidth
    }];
};

/**
 * Returns the path for drawing the backward facing arrow head.
 *
 * @returns {*[]} path of the backward facing arrow head
 */
FlowEdge.prototype.getBackwardTip = function() {
    var insetX = this.startPt.x + arrHeight * this.dx;
    var insetY = this.startPt.y + arrHeight * this.dy;

    return [{
        x: insetX + this.dy * arrWidth,
        y: insetY - this.dx * arrWidth
    },{
        x: this.startPt.x,
        y: this.startPt.y
    },{
        x: insetX - this.dy * arrWidth,
        y: insetY + this.dx * arrWidth
    }];
};

