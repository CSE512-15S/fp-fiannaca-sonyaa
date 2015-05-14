//Private

//Public
module.exports = FlowNode;

function FlowNode(json) {
    this.description = json;
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

