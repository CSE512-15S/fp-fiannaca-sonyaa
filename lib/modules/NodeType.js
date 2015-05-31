//Private
var FlowNode = require('../modules/FlowNode');

//Public
module.exports = NodeType;

/**
 * Gets an invisible dummy node
 *
 * @returns {NodeType}  Returns a dummy node with no scaling and zero padding, width, and height
 */
module.exports.GetDummy = function() {
    var dummy = new NodeType("Dummy", "Dummy Node", "This is an invisible dummy node", null);

    dummy.hasOffsetEdge = false;
    dummy.hasPaddedEdge = false;

    dummy.padding = 0;
    dummy.width = 0;
    dummy.height = 0;
    dummy.scale = 1.0;

    return dummy;
};

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

    this.hasOffsetEdge = true;
    this.hasPaddedEdge = true;

    // Default display parameters
    this.padding = 60;
    this.width = 0;
    this.height = 0;
    this.scale = 1.0;

    this._svg  = svg;
}

NodeType.prototype.SetWidth = function(width) {
    this.width = width;
};

NodeType.prototype.SetHeight = function(height) {
    this.height = height;
};

NodeType.prototype.SetScale = function(scale) {
    this.scale = scale;
};

/**
 * Gets an svg document fragment from the view string.
 *
 * @param {String}  view    The view property from the config json file. Either contains a path to an svg file, or inline
 * svg code.
 */
function GetFragment(view) {
    var frag = Snap.parse(view);

    var g = frag.select('g');
    g.attr('class', 'node-svg');

    return g;
}

/**
 * This function returns the entirety of the SVG document provided in the config JSON file
 *
 * @return {Fragment}   A document fragment with a root SVG node
 */
NodeType.prototype.getRawSvg = function() {
    return Snap.parse(this._svg);
};

/**
 * Returns a group containing the svg for the a node of this type.
 *
 * @return {Fragment}   A document fragment starting with the 'g.node-svg' node
 */
NodeType.prototype.getSvg = function() {
    return GetFragment(this._svg);
};

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