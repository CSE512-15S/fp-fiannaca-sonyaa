var fv = null;

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

// TODO: Move these parameters to the config object!
// TODO: Allow these parameters to be evaluated by a UDF so that the size of the arrow head can vary!

/**
 * Distance from tip to base of arrowhead
 * @type {number}
 */
var arrHeight = 25;

/**
 * Distance from the left to the right sides of the arrow head
 * @type {number}
 */
var arrWidth = 10;

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
    this.start = start;
    this.end = end;

    this.direction = direction;
    this.dirOffset = 0;

    this.startConnectionType = startConnType;
    this.endConnectionType = endConnType;

    this.startEdgeOffset = this.start.type.GetEdgeOffset(this.startConnectionType);
    this.endEdgeOffset = this.end.type.GetEdgeOffset(this.endConnectionType);

    this._svgpath = "";

    if(direction < module.exports.FORWARD || direction > module.exports.STD) {
        throw new Error("Direction must be one of FlowEdge.{FORWARD, BACKWARD, STD}");
    }

    this.Update();
}

/**
 * Updates the beginning and ending points of the this edge based on the start and end node locations. This should be
 * called anytime an edge is created or either of the connected nodes is moved.
 */
FlowEdge.prototype.Update = function() {
    if(this.direction === FlowEdge.FORWARD) this.dirOffset = 20;
    if(this.direction === FlowEdge.BACKWARD) this.dirOffset = -20;
    if(this.direction === FlowEdge.STD) this.dirOffset = 0;

    var start = this.start;
    var end = this.end;

    var denom =  Math.sqrt(Math.pow(end.x - start.x,2) + Math.pow(end.y - start.y,2));

    this.dx = ((end.x - start.x) / denom);
    this.dy = ((end.y - start.y) / denom);

    this.startPt = {
        x: start.x + this.start.padding * this.dx + this.start.edgeXOffset,
        y: start.y + this.start.padding * this.dy + this.start.edgeYOffset
    };

    this.endPt = {
        x: end.x - this.end.padding * this.dx + this.end.edgeXOffset,
        y: end.y - this.end.padding * this.dy + this.end.edgeYOffset
    };


    if(this.dirOffset > 0) {
        this.startPt.x += this.dy * this.dirOffset;
        this.startPt.y -= this.dx * this.dirOffset;
        this.endPt.x += this.dy * this.dirOffset;
        this.endPt.y -= this.dx * this.dirOffset;
    } else if(this.dirOffset < 0) {
        this.startPt.x -= this.dy * this.dirOffset;
        this.startPt.y += this.dx * this.dirOffset;
        this.endPt.x -= this.dy * this.dirOffset;
        this.endPt.y += this.dx * this.dirOffset;
    }

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

