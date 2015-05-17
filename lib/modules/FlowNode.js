//Private

//Public
module.exports = FlowNode;

function FlowNode(nodeType, x, y) {
    this.type = nodeType;
    this.x = x;
    this.y = y;
}

/**
 * Attaches this node to the current visualization
 */
FlowNode.prototype.attach = function() {

};

/**
 * Displays the possible nodes that could be attached after this node
 */
FlowNode.prototype.showNextNodes = function() {

};

