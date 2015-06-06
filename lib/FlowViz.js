var ConfigParser = require('./modules/ConfigParser');
var Renderer = require('./modules/Renderer');
var GraphManager = require('./modules/GraphManager');
var Layout = require('./modules/Layout');
var FlowNode = require('./modules/FlowNode');
var FlowEdge = require('./modules/FlowEdge');
var Selection = require('./modules/NodeSelection');
var ConstraintChecker = require('./modules/ConstraintChecker');
var Interactions = require('./modules/Interactions');
var App = require('./modules/FlowViz.App');

var Controls = require('./modules/Controls');
var Legend = require('./modules/Legend');
var DataEditor = require('./modules/DataEditor');
var Notify = require('./modules/Notify');

var Inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
Inherits(FlowViz, EventEmitter);

var events = [
    'flowviz-ready',     // 0 params
    'config-ready',      // 0 params
    'config-error',      // 1 param:  msg
    'renderer-updated',  // 0 params
    'renderer-redrawn',  // 0 params
    'node-added',        // 1 param:  node
    'node-removed',      // 1 param:  node
    'edge-added',        // 1 param:  edge
    'edge-removed',      // 1 param:  edge
    'notify-std',        // 2 params: msg, duration
    'notify-warn',       // 2 params: msg, duration
    'notify-error',      // 2 params: msg, duration
    'notify-clear',      // 0 params
    'selection-cleared', // 0 params
    'selection-changed', // 1 param:  node
    'node-data-changed', // 3 params: node, dataItem, oldValue
    'edge-data-changed'  // 3 params: edge, dataItem, oldValue
];

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

    this.FlowEdge = FlowEdge;
    this.FlowNode = FlowNode;

    FlowNode.SetFvRef(this);
    FlowEdge.SetFvRef(this);

    this.Config = new ConfigParser(config, app, this);
    this.on('config-ready', function() {
        // Create module objects
        that.Interactions = new Interactions(that);
        that.Selection = new Selection(that);
        that.Layout = new Layout(that);
        that.Renderer = new Renderer(that);
        that.ConstraintChecker = new ConstraintChecker(that);
        that.GraphManager = new GraphManager(that);

        // Initialize AddOns
        that.Notify = new Notify(that);
        that.Controls = new Controls(that);
        that.Legend = new Legend(that);
        that.DataEditor = new DataEditor(that);

        // Run the first rendering
        that.Renderer.Update();


        // Signal that we are ready to go
        that.emit('flowviz-ready');
    });
    this.on('config-error', function(msg) {
        that.ShowError(msg, -1);
    })
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

/**
 * Shows a standard status message in the interface.
 *
 * @param {string}  msg         Message to show
 * @param {number}  duration    How long to show the message
 */
FlowViz.prototype.ShowMessage = function(msg, duration) {
    if(duration === undefined) {
        duration = Notify.NORMAL;
    }

    this.emit('notify-std', msg, duration);
};

/**
 * Shows a warning message in the interface.
 *
 * @param {string}  msg         Message to show
 * @param {number}  duration    How long to show the message
 */
FlowViz.prototype.ShowWarning = function(msg, duration) {
    if(duration === undefined) {
        duration = Notify.LONG;
    }

    this.emit('notify-warn', msg, duration);
};

/**
 * Shows an error message in the interface.
 *
 * @param {string}  msg         Message to show
 * @param {number}  duration    How long to show the message
 */
FlowViz.prototype.ShowError = function(msg, duration) {
    if(duration === undefined) {
        duration = Notify.LONG;
    }

    this.emit('notify-error', msg, duration);
};