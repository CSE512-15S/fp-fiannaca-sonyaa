//Private
var FlowNode = require('../modules/FlowNode');

//Public
module.exports = NodeType;

function NodeType(type, name, desc, svg) {
    this.type = type;
    this.name = name;
    this.desc = desc;
    this.svg  = svg;
}

/**
 * Returns an instance of this node type to be added to the vizualization
 */
NodeType.prototype.getNode = function(x, y) {
    return FlowNode(this);
};

/**
 * Gets only the top level nodes, but attaches a function to each top level node which can return its sub types
 */
NodeType.prototype.getSubNodeTypes = function() {

};