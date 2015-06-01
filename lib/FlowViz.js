//Private
var ConfigParser = require('./modules/ConfigParser');
var Legend = require('./modules/Legend');
var Renderer = require('./modules/Renderer');
var GraphManager = require('./modules/GraphManager');
var Layout = require('./modules/Layout');
var FlowNode = require('./modules/FlowNode');
var FlowEdge = require('./modules/FlowEdge');
var Notify = require('./modules/Notify');
var App = require('./modules/FlowViz.App');

var Inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

Inherits(FlowViz, EventEmitter);

var events = ['ready'];

//Public
module.exports = FlowViz;
module.exports.App = App;

/**
 * The main class of the FlowViz library. This module is responsible for tying together all of the other modules of the
 * library
 *
 * @param {String}  config      The relative path to a JSON file containing the FlowViz configuration information
 * @param {String}  selector    A CSS-style selector for the SVG tag in which the visualization should be generated
 *
 * @constructor Sets parameters, initializes a ConfigParser instance, and then sets up the legend and renderer once the
 * configuration info is ready
 */
function FlowViz(app, config, selector){
    var that = this;

    this.DebugMode = false;

    this.App = app;
    this.Legend = null;
    this.Renderer = null;
    this.Selector = selector;

    FlowNode.SetFvRef(this);
    FlowEdge.SetFvRef(this);

    this.Config = new ConfigParser(config);
    this.Config.on('config-ready', function() {
        // Create module objects
        that.Notify = new Notify(that);
        that.Layout = new Layout(that);
        that.Renderer = new Renderer(that);
        that.GraphManager = new GraphManager(that);
        that.Legend = new Legend(that);

        // Run the first rendering
        that.Renderer.Update();

        that.ShowError("This is yet another test", Notify.SHORT);

        // Signal that we are ready to go
        that.emit('flowviz-ready');
    });
}

/**
 * Checks to see if a given event is in the list of events that this module emits
 *
 * @param   {String}    evt     The name of an event (e.g. 'ready')
 * @return  {boolean}   Indicates if this module emits the given event
 */
FlowViz.prototype.HasEvent = function(evt) {
    return $.inArray(evt, events) >= 0;
};

FlowViz.prototype.ShowMessage = function(msg, duration) {
    this.emit('notify-std', msg, duration);
};

FlowViz.prototype.ShowWarning = function(msg, duration) {
    this.emit('notify-warn', msg, duration);
};

FlowViz.prototype.ShowError = function(msg, duration) {
    this.emit('notify-error', msg, duration);
};