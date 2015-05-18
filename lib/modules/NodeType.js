//Private
var FlowNode = require('../modules/FlowNode');

//Public
module.exports = NodeType;

/**
 * This class is responsible for managing the type information for possible nodes in the graph.
 *
 * TODO: Add the means for tracking/accessing parent and children types
 *
 * @param {String}      type    The name of this type (e.g. 'IfElseBranch')
 * @param {String}      name    The display friendly name of this type (e.g. 'If ... Else ...')
 * @param {String}      desc    This is a brief description of what this nodes of this type are for
 * @param {Fragment}    svg     This is a document fragment of svg which is the visual representation of nodes of this type
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
 * Creates an instance of a node of this type.
 *
 * @param   {Number}    x   The x position to place this node at
 * @param   {Number}    y   The y position to place this node at
 *
 * @return  {FlowNode}  A new node of this type
 */
NodeType.prototype.getNode = function(x, y) {
    return FlowNode(this, x, y);
};

/**
 * TODO: Return a list of the NodeType objects for this NodeType's immediate children
 */
NodeType.prototype.getSubNodeTypes = function() {

};