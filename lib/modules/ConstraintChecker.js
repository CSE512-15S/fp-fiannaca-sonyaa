//Private
var Inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');

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
 * @param {object}  edges    The list of edges in the graph
 *
 * @constructor Sets parameters
 */
ConstraintChecker.prototype.IsValidEdge = function(from, to, edges) {
    var fromConstraints = from.type.GetConstraintObject();
    var toConstraints = to.type.GetConstraintObject();
    // Collect all edges that stem from "from" or connect to "to".
    var fromEdges = [];
    var toEdges = [];
    _.forEach(edges, function(edge) {
        if (edge.start === from) {
            fromEdges.push(edge);
        }
        if (edge.end === to) {
            toEdges.push(edge);
        }
        // We don't check if edge from "from" to "to" already exists, that is done elsewhere.
    });
    console.log(fromEdges);
    console.log(fromConstraints.outgoing.range[1]);
    // Check that number of edges from "from" is not at maximum yet.
    if (fromEdges.length >= fromConstraints.outgoing.range[1]) {
        console.error('The start node already has maximum number of outgoing edges.');
        return false;
    }
    // Check that number of edges to "to" is not at maximum yet.
    if (toEdges.length >= toConstraints.incoming.range[1]) {
        console.error('The end node already has maximum number of incoming edges.');
        return false;
    }
    // Check that "to" type is an allowable type for "from".
    if (!IsTypeValid(to.type, fromConstraints.outgoing.types)) {
        console.error('The end node is an invalid outgoing node for the start node.');
        return false;
    }
    // Check that "from" type is an allowable type for "to".
    if (!IsTypeValid(from.type, toConstraints.incoming.types)) {
        console.error('The start node is an invalid incoming node for the end node.');
        return false;
    }
    // TODO also check that range is valid

    return true;
};

function IsTypeValid(typeToCheck, typesObject) {
    for (var type in typesObject) {
        if (typesObject.hasOwnProperty(type)) {
            if (type === "*") {
                // Any type is allowed
                return true;
            }
            if (type === typeToCheck.type) {
                return true;
            }
            var index = type.indexOf("*");
            if (index > -1) {
                // This is not a leaf type.
                var actualType = type.slice(0, index-1);
                var parent = typeToCheck.GetParent();
                while (parent != null) {
                    if (parent.type === actualType) {
                        return true;
                    }
                    parent = parent.GetParent();
                }
            }
        }
    }
    return false;
}