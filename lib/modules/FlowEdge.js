// Arrow Height - Distance from tip to base of arrowhead
var arrHeight = 25;

// Arrow Width - Distance from the left to the right sides of the arrow head
var arrWidth = 10;

module.exports = FlowEdge;

// Possible edge directions
module.exports.FORWARD = 0;
module.exports.BACKWARD = 1;
module.exports.BOTH = 2;
module.exports.NONE = 3;

/**
 * Defines the FlowEdge type. This encapsulates an edge between nodes in the FlowViz graph.
 *
 * @param {FlowNode}    start               The node from which the edge starts
 * @param {FlowNode}    end                 The node to which the edge ends
 * @param {number}      direction           Indicating the direction in which arrows should be drawn on this edge
 *
 * @constructor Calculates the points of the start and end of the edge.
 */
function FlowEdge(start, end, direction) {
    this.start = start;
    this.end = end;
    this.direction = direction;

    if(direction < module.exports.FORWARD || direction > module.exports.NONE) {
        throw new Error("Direction must be one of FlowEdge.{FORWARD, BACKWARD, BOTH, or NONE}");
    }

    this.Update();
}

/**
 * Updates the beginning and ending points of the this edge based on the start and end node locations. This should be
 * called anytime an edge is created or either of the connected nodes is moved.
 */
FlowEdge.prototype.Update = function() {
    var denom =  Math.sqrt(Math.pow(this.end.x - this.start.x,2) + Math.pow(this.end.y - this.start.y,2));

    this.dx = ((this.end.x - this.start.x) / denom);
    this.dy = ((this.end.y - this.start.y) / denom);

    this.startPt = {
        x: this.start.x + this.start.padding * this.dx + this.start.edgeXOffset,
        y: this.start.y + this.start.padding * this.dy + this.start.edgeYOffset
    };

    this.endPt = {
        x: this.end.x - this.end.padding * this.dx + this.end.edgeXOffset,
        y: this.end.y - this.end.padding * this.dy + this.end.edgeYOffset
    };
};

/**
 * Creates a list of points that constitute the path of the body of the edge.
 *
 * @return {Array} Points along which to draw the edge
 */
FlowEdge.prototype.getPath = function() {
    return [this.startPt, this.endPt];
};

/**
 * Returns the path for drawing the forward facing arrow head.
 *
 * @return {Array} path of the forward facing arrow head
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
 * @return {Array} path of the backward facing arrow head
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

