//Private
var NodeType = require('../modules/NodeType');

//Public
module.exports = FlowNode;

/**
 * Defines the FlowNode type. This type encapsulates nodes in the FlowViz graph
 *
 * @param {NodeType}    nodeType            The type of graph node that this node represents.
 * @param {Number}      x                   The initial X position of this node in the visualization.
 * @param {Number}      y                   The initial Y position of this node in the visualization.
 *
 * @constructor Simply sets parameters for the time being.
 */
function FlowNode(nodeType, x, y) {
    this.type = nodeType;

    this.x = x;
    this.y = y;

    // Manage additional data items which can be attached to this node

    // Set display parameters
    if(this.type.hasOffsetEdge) {
        this.edgeXOffset = this.type.scale * this.type.width / 2;
        this.edgeYOffset = this.type.scale * this.type.height / 2;
    } else {
        this.edgeXOffset = 0;
        this.edgeYOffset = 0;
    }

    if(this.type.hasPaddedEdge) {
        this.padding = this.type.padding;
    } else {
        this.padding = 0;
    }
}

FlowNode.prototype.SetDataItem = function(key, value) {

};

/**
 * TODO: This is a possible function which we may want to add. This would look into the this.type object and determine
 *       which other node types could be connected to this node...
 */
FlowNode.prototype.showNextNodes = function() {

};

