var _ = require('lodash');

var NodeType = require('../modules/NodeType');

var fv = null;
var id_count = 0;

module.exports = FlowNode;

/**
 * Sets this module's static reference to the main FlowViz object
 *
 * @param {FlowViz} flowviz The main FlowViz object
 */
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
    this.id = "node-" + id_count;
    id_count += 1;

    this.type = nodeType;

    this.x = x;
    this.y = y;

    // Manage additional data items which can be attached to this node
    this.DataItems = this.type.GetDataObject();
}

FlowNode.prototype.getJSON = function() {
    return {
        "id": this.id,
        "type-id": this.type.id,
        "x": this.x,
        "y": this.y,
        "data": this.DataItems
    };
};

FlowNode.prototype.getEdges = function() {
    var myEdges = [];

    var that = this;
    _.forEach(fv.GraphManager.edges, function(edge) {
        if(edge.start === that || edge.end === that) {
            myEdges.push(edge);
        }
    });

    return myEdges;
};

FlowNode.prototype.getOutgoingEdges = function() {
    var myEdges = [];

    var that = this;
    _.forEach(fv.GraphManager.edges, function(edge) {
        if(edge.start === that) {
            myEdges.push(edge);
        }
    });

    return myEdges;
};

FlowNode.prototype.getIncomingEdges = function() {
    var myEdges = [];

    var that = this;
    _.forEach(fv.GraphManager.edges, function(edge) {
        if(edge.end === that) {
            myEdges.push(edge);
        }
    });

    return myEdges;
};

/**
 * Sets a data item with the given key to the given value
 *
 * @param {String}  key     The data item's key
 * @param {Object}  value   The data item's value
 */
FlowNode.prototype.SetDataItem = function(key, value) {
    if(this.DataItems.hasOwnProperty(key)) {
        var item = this.DataItems[key];

        // Basic validation
        if(typeof value !== item.type) {
            console.error("\"" + key + "\" can only be set with values of type \"" + item.type + "\"");
            return false;
        }

        // Advanced validation
        if(item.hasOwnProperty("validator")) {
            var name = item.validator;

            if (!fv.App.Validate(name, item.value, value)) {

                var invalid = value + " is not a valid value for \"" + key + "\".";
                var issue = " It violates validator \"" + name + "\"";
                console.error(invalid + issue);

                return false;
            }
        }

        item.value = value;
        console.log("DataItem \"" + key + "\" has been set to " + value);

        return true;
    } else {
        console.error("The \"" + this.type.name + "\" NodeType does not have a data item with the key \"" + key + "\"!");
        return false;
    }
};

FlowNode.prototype.GetDataItemValue = function(key) {
    if (this.DataItems.hasOwnProperty(key)) {
        return this.DataItems[key].value;
    }
    return null;
};
