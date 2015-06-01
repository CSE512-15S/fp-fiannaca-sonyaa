//Private
var NodeType = require('../modules/NodeType');

var fv = null;

//Public
module.exports = FlowNode;
module.exports.SetFvRef = function(flowviz) {
    fv = flowviz;
};

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
    this.DataItems = this.type.GetDataObject();

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

/**
 * Sets a data item with the given key to the given value
 *
 * @param {String}  key     The data item's key
 * @param {Object}  value   The data item's value
 */
FlowNode.prototype.SetDataItem = function(key, value) {
    if(this.DataItems.hasOwnProperty(key)) {
        // Basic validation
        if(typeof value !== this.DataItems[key].type) {
            console.error("\"" + key + "\" can only be set with values of type \"" + this.DataItems[key].type + "\"");
            return;
        }

        // Advanced validation
        if(this.DataItems[key].hasOwnProperty("validator")) {
            var name = this.DataItems[key].validator;

            if (!fv.App.Validate(name, this.DataItems[key].value, value)) {

                var invalid = value + " is not a valid value for \"" + key + "\".";
                var issue = " It violates validator \"" + name + "\"";
                console.error(invalid + issue);

                return;
            }
        }

        this.DataItems[key].value = value;
        console.log("DataItem \"" + key + "\" has been set to " + value);
    } else {
        console.error("The \"" + this.type.name + "\" NodeType does not have a data item with the key \"" + key + "\"!");
    }
};

/**
 * TODO: This is a possible function which we may want to add. This would look into the this.type object and determine
 *       which other node types could be connected to this node...
 */
FlowNode.prototype.ShowNextNodes = function() {

};

