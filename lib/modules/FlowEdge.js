var NodeType = require('../modules/NodeType');

var fv = null;
var id_count = 0;

module.exports = FlowEdge;

// Possible edge directions
module.exports.FORWARD = 0;
module.exports.BACKWARD = 1;
module.exports.STD = 2;

module.exports.TOTAL_DIRS = 2;

//module.exports.BOTH = 2;
//module.exports.NONE = 3;

// Standard point of connection
module.exports.NORMAL = "NORMAL";

/**
 * Distance from tip to base of arrowhead
 * @type {number}
 */
var arrHeight = 0;

/**
 * Distance from the left to the right sides of the arrow head
 * @type {number}
 */
var arrWidth = 0;

/**
 * Sets this module's static reference to the FlowViz object
 *
 * @param {FlowViz} flowviz Static reference to the main FlowViz object
 */
module.exports.SetFvRef = function(flowviz) {
    fv = flowviz;
};

/**
 * Static function for setting the display properties of arrow heads drawn on edges
 *
 * @param {number}  width   
 * @param {number}  height
 */
module.exports.SetArrowProps = function(width, height) {
    arrHeight = height;
    arrWidth = width;
};

/**
 * Defines the FlowEdge type. This encapsulates an edge between nodes in the FlowViz graph.
 *
 * @param {FlowNode}    start               The node from which the edge starts
 * @param {FlowNode}    end                 The node to which the edge ends
 * @param {number}      direction           Indicating the direction in which arrows should be drawn on this edge
 *
 * @constructor Calculates the points of the start and end of the edge.
 */
function FlowEdge(start, end, direction, startConnType, endConnType) {
    this.id = "edge-" + id_count;
    id_count += 1;

    this.start = start;
    this.end = end;

    this.direction = direction;
    this.dirOffset = 0;

    this.startConnectionType = null;
    this.endConnectionType = null;

    this.startOffset = this.start.type.GetEdgeOffset(this.startConnectionType);
    this.endOffset = this.end.type.GetEdgeOffset(this.endConnectionType);

    this.startPadding = this.start.type.GetEdgePadding(this.startConnectionType);
    this.endPadding = this.end.type.GetEdgePadding(this.endConnectionType);

    this._svgpath = "";

    if(direction < module.exports.FORWARD || direction > module.exports.STD) {
        throw new Error("Direction must be one of FlowEdge.{FORWARD, BACKWARD, STD}");
    }

    this.Update();
}

FlowEdge.prototype.getJSON = function() {
    return {
        "id": this.id,
        "start-id": this.start.id,
        "end-id": this.end.id
    };
};

/**
 * Updates the beginning and ending points of the this edge based on the start and end node locations. This should be
 * called anytime an edge is created or either of the connected nodes is moved.
 */
FlowEdge.prototype.Update = function() {
    // Find the end points of the edge
    this.startPt = {x: this.start.x + this.startOffset.x, y: this.start.y + this.startOffset.y};
    this.endPt = {x: this.end.x + this.endOffset.x, y: this.end.y + this.endOffset.y};

    if(this.end.type.type !== NodeType.DUMMY) {
        // Get unit vector
        var dn = Math.sqrt(Math.pow(this.endPt.x - this.startPt.x, 2) + Math.pow(this.endPt.y - this.startPt.y, 2));
        this.dx = ((this.end.x - this.start.x) / dn);
        this.dy = ((this.end.y - this.start.y) / dn);

        // Pad along unit vector direction
        this.startPt.x += this.startPadding * this.dx;
        this.startPt.y += this.startPadding * this.dy;
        this.endPt.x -= this.endPadding * this.dx;
        this.endPt.y -= this.endPadding * this.dy;

        // Account for two edges between the same nodes
        this.dirOffset = (this.direction === FlowEdge.STD) ? 0 : 12;
        this.startPt.x += this.dy * this.dirOffset;
        this.startPt.y -= this.dx * this.dirOffset;
        this.endPt.x += this.dy * this.dirOffset;
        this.endPt.y -= this.dx * this.dirOffset;
    }

    // Create the points array that will be returned from calls to getPath()
    this.points = [];
    this.points.push(this.startPt);
    this.points.push(this.endPt);
};

/**
 * Creates a list of points that constitute the path of the body of the edge.
 *
 * @return {Array} Points along which to draw the edge
 */
FlowEdge.prototype.getPath = function() {
    return this.points;
};

/**
 * Returns the current SVG path information for this edge.
 *
 * @returns {string} SVG path string
 */
FlowEdge.prototype.getSvgPath = function() {
    return this._svgpath;
};

/**
 * Sets the SVG path information for this edge.
 *
 * @param {string}    path    SVG path string
 */
FlowEdge.prototype.setSvgPath = function(path) {
    this._svgpath = path;
};


/**
 * Returns the path for drawing the arrow head at the front of the edge.
 *
 * @return {Array} path of the arrow head
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

