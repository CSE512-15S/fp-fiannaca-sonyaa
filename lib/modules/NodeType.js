//Private
var FlowNode = require('../modules/FlowNode');

//Public
module.exports = NodeType;

/**
 * This class is responsible for managing the type information for possible nodes in the graph.
 *
 * TODO: Add the means for tracking/accessing parent and children types
 *
 * @param type The name of this type (e.g. 'IfElseBranch')
 * @param name The display friendly name of this type (e.g. 'If ... Else ...')
 * @param desc This is a brief description of what this nodes of this type are for
 * @param svg This is a document fragment of svg which is the visual representation of nodes of this type
 *
 * @constructor Simply sets parameters for the time being
 */
function NodeType(type, name, desc, svg) {
    this.type = type;
    this.name = name;
    this.desc = desc;
    this.svg  = svg;
}

/**
 * Returns an instance of a node of this type
 */
NodeType.prototype.getNode = function(x, y) {
    return FlowNode(this);
};

/**
 * TODO: Return a list of the NodeType objects for this NodeType's immediate children
 */
NodeType.prototype.getSubNodeTypes = function() {

};