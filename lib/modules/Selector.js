var Inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

Inherits(Selector, EventEmitter);

var fv = null;

module.exports = Selector;

/**
 * The Notify module manages displaying messages from the FlowViz library to the end user. This can include standard
 * status messages, warning messages, or error messages
 *
 * @param {FlowViz} flowviz A reference to the current instance of the FlowViz library
 */
function Selector(flowviz) {
    fv = flowviz;


}