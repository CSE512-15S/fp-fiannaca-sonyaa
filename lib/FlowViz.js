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

/**
 * The main class of the FlowViz library. This module is responsible for tying together all of the other modules of the
 * library
 *
 * @param config (String) The relative path to a JSON file containing the FlowViz configuration information
 * @param selector (String) A CSS-style selector for the SVG tag in which the visualization should be generated
 *
 * @constructor Sets parameters, initializes a ConfigParser instance, and then sets up the legend and renderer once the
 * configuration info is ready
 */
function FlowViz(config, selector){
    var that = this;

    this.Legend = null;
    this.Renderer = null;

    this._viz = null;

    this.config = new ConfigParser(config);
    this.config.on('config-ready', function() {
        that._viz =  d3.select(selector);

        that.Renderer = new Renderer(that._viz, that.config);
        that.Legend = new Legend(that.config);

        that.Renderer.Update();

        that.emit('flowviz-ready');
    });
}

/**
 * Checks to see if a given event is in the list of events that this module emits
 *
 * @param evt (String) The name of an event (e.g. 'ready')
 * @returns {boolean} Indicates if this module emits the given event
 */
FlowViz.prototype.HasEvent = function(evt) {
    if($.inArray(evt, events) >= 0) {
        return true;
    }

    return false;
};