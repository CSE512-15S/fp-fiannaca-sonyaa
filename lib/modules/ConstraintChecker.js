//Private
var Inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

var fv = null;

Inherits(ConstraintChecker, EventEmitter);

//Public Interface
module.exports = ConstraintChecker;

/**
 * This class checks constraints imposed on the graph.
 *
 * @param {FlowViz}  flowviz    A reference to the FlowViz object
 *
 * @constructor Sets parameters
 */
function ConstraintChecker(flowviz) {
    fv = flowviz;
}

/**
 * Check if the edge is permitted based on constraints.
 *
 * @param {FlowNode}  from    The starting node of an edge
 * @param {FlowNode}  to    The ending node of an edge
 *
 * @constructor Sets parameters
 */
ConstraintChecker.prototype.IsValidEdge = function(from, to) {
    //Public Function
    return true;
};