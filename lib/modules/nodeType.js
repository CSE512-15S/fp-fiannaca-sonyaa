//Private

//Public
module.exports = NodeType;

function NodeType(json) {
   this.description = json;
}

/**
 * Returns an instance of this node type to be added to the vizualization
 */
NodeType.prototype.getNode = function() {

};

/**
 * Gets only the top level nodes, but attaches a function to each top level node which can return its sub types
 */
NodeType.prototype.getSubNodeTypes = function() {

};