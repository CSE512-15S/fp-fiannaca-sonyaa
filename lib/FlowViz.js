/*
 * Notes on Callbacks that should be passed to this
 *
 */

//Private
var ConfigParser = require('./modules/ConfigParser');
var Legend = require('./modules/Legend');
var Renderer = require('./modules/Renderer');
var App = require('./modules/FlowViz.App');

var Inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

Inherits(FlowViz, EventEmitter);

var events = ['ready'];

//Public
module.exports = FlowViz;
module.exports.App = App;

function FlowViz(config, selector){
    var that = this;

    this.Legend = null;
    this.Renderer = null;

    this._viz = null;

    this.config = new ConfigParser(config);
    this.config.on('config-ready', function() {
        that.viz =  d3.select(selector);

        that.Renderer = new Renderer(that.viz, that.config);
        that.Legend = new Legend(that.config);

        that.Renderer.Update();

        that.emit('flowviz-ready');
    });
}

FlowViz.prototype.HasEvent = function(evt) {
    if($.inArray(evt, events) >= 0) {
        return true;
    }

    return false;
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