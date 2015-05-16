/*
 * Notes on Callbacks that should be passed to this
 *
 */

//Private
var ConfigParser = require('./modules/ConfigParser');
var Inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

Inherits(FlowViz, EventEmitter);

//Public
module.exports = FlowViz;

function FlowViz(config, callbacks){
    var that = this;

    this.config = new ConfigParser(config);
    this.config.on('config-ready', function() {
        that.emit('flowviz-ready');
    });

    this.callbacks = callbacks;
    this.viz = null;
}

FlowViz.prototype.run = function(selector) {
    console.log('Config File: ' + this.config.file);

    this.viz = d3.select(selector);
};

FlowViz.prototype.getAllNodeTypes = function() {
    return this.config.getAllNodeTypes();
};

/**
 * Adds a node to the graph of the given type by attaching it the the given parent
 *
 * @param nodeType The type of node which should be added to the graph
 * @param parent The parent node that the new node should be attached to
 * @param x (Optional) The x location to place the node
 * @param y (Optional) The y location to place the node
 */
FlowViz.prototype.addNodeOfType = function(nodeType, parent, x, y) {
    //TODO: Check constraints here
};

/**
 * Removes a node and possibly its children from the graph
 *
 * @param node The node to remove
 * @param removeChildren A boolean flag indicating if the node's children should be removed
 */
FlowViz.prototype.removeNode = function(node, removeChildren) {
    //TODO: Remove the node passed in
};