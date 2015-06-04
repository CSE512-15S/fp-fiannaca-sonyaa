var _ = require('lodash');

var FlowNode = require('../modules/FlowNode');

module.exports = NodeType;

module.exports.DUMMY = "Dummy";

/**
 * Gets an invisible dummy node
 *
 * @returns {NodeType}  Returns a dummy node with no scaling and zero padding, width, and height
 */
module.exports.GetDummy = function() {
    var dummy = new NodeType(module.exports.DUMMY, "Dummy Node", "This is an invisible dummy node", null);

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
    this.padding = 40;
    this.width = 0;
    this.height = 0;
    this.scale = 1.0;

    // Default type hierarchy relationships
    this.Parent = null;
    this.Children = null;
    this.DataProperties = null;
    this.Connections = null;
    this.Constraints = null;

    this._svg  = svg;
}

NodeType.prototype.GetEdgeOffset = function(connType) {
    if(this.hasOffsetEdge) {
        if(connType !== undefined && this.Connections !== null) {
            if(this.Connections.hasOwnProperty(connType)) {
                return {
                    x: this.Connections[connType].x * this.scale,
                    y: this.Connections[connType].y * this.scale
                }
            }
        }

        return {
            x: this.scale * this.width / 2,
            y: this.scale * this.height / 2
        }
    }

    return {
        x: 0,
        y: 0
    };
};

NodeType.prototype.GetEdgePadding = function(connType) {
    if(this.hasPaddedEdge) {
        return this.padding;
    }

    return 0;
};

/**
 * Sets the width in pixels of this type of node
 *
 * @param {number}  width   The width in pixels
 */
NodeType.prototype.SetWidth = function(width) {
    this.width = width;
};

/**
 * Sets the height in pixels of this type of node
 *
 * @param {number}  height   The height in pixels
 */
NodeType.prototype.SetHeight = function(height) {
    this.height = height;
};

/**
 * Sets the percentage (0.0 to 1.0) by which the view for this node type should be scaled when added to the interface
 *
 * @param {number}  scale   A percentage between 0.0 and 1.0
 */
NodeType.prototype.SetScale = function(scale) {
    if(scale > 1.0 || scale < 0.0) scale = 1.0;

    this.scale = scale;
};

/**
 * Sets the data properties object for this type of node. This is derived from the config object.
 *
 * @param {number}  json   JSON object describing the data properties for this type of node.
 */
NodeType.prototype.SetProperties = function(json) {
    this.DataProperties = json;
};

NodeType.prototype.SetConnections = function(connections) {
    this.Connections = connections;
};

/**
 * Sets the node constraints object for this type of node. This is derived from the config object.
 *
 * @param {number}  json   JSON object describing the constraints for this type of node.
 */
NodeType.prototype.SetConstraints = function(json) {
    this.Constraints = json;
};

/**
 * Sets the parent node type for this type of node. This is derived from the type hierarchy in the config object.
 *
 * @param {number}  parent   A reference to the parent NodeType object
 */
NodeType.prototype.SetParent = function(parent) {
    this.Parent = parent;
};

/**
 * Sets the children node types of this type of node. This is derived from the type hierarchy in the config object.
 *
 * @param {number}  children   An array with references to the children NodeType objects
 */
NodeType.prototype.SetChildren = function(children) {
    this.Children = children;
};

/**
 * Indicates if this type has a parent NodeType
 *
 * @return {boolean} True if this NodeType has a parent NodeType
 */
NodeType.prototype.HasParent = function() {
    return (this.Parent !== null);
};


/**
 * If this NodeType has a parent NodeType, this wil return the parent.
 *
 * @return {NodeType} The parent NodeType. Null if no parent exists
 */
NodeType.prototype.GetParent = function() {
    return this.Parent;
};

/**
 * Indicates if this type has any children NodeTypes
 *
 * @return {boolean} True if this NodeType has children NodeTypes
 */
NodeType.prototype.HasChildren = function() {
    return (this.Children !== null);
};

/**
 * Gets a clone of the DataProperties object which can be populated with data by the FlowNode object
 *
 * @return {object} A clone of the DataProperties object
 */
NodeType.prototype.GetDataObject = function() {
    var obj = $.extend(true, {}, this.DataProperties, null);

    return obj;
};

/**
 * Gets a clone of the Constraints object which can be used by the FlowNode object
 *
 * @return {object} A clone of the Constraints object
 */
NodeType.prototype.GetConstraintObject = function() {
    return $.extend(true, {}, this.Constraints, null);
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