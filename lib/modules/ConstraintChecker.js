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
    // Collect all nodes are connected to "from" or "to".
    var fromNeighbors = [];
    var toNeighbors = [];
    _.forEach(edges, function(edge) {
        if (edge.start === from) {
            fromNeighbors.push(edge.end);
        }
        if (edge.end === to) {
            toNeighbors.push(edge.start);
        }
        // We don't check if edge from "from" to "to" already exists, that is done elsewhere.
    });
    // Check that number of edges from "from" is not at maximum yet.
    if (fromNeighbors.length >= fromConstraints.outgoing.range[1]) {
        console.error('The start node already has maximum number of outgoing edges.');
        return false;
    }
    // Check that number of edges to "to" is not at maximum yet.
    if (toNeighbors.length >= toConstraints.incoming.range[1]) {
        console.error('The end node already has maximum number of incoming edges.');
        return false;
    }
    // Check that "to" type is an allowable type for "from"
    // and that "from" hasn't exceeded the limit of neighbors of type "to".
    if (!CheckTypes(to.type, fromConstraints.outgoing.types, fromNeighbors)) {
        console.error('The end node is an invalid outgoing node for the start node ' +
            'or the maximum number of edges of this type is exceeded.');
        return false;
    }
    // Check that "from" type is an allowable type for "to"
    // and that "to" hasn't exceeded the limit of neighbors of type "from".
    if (!CheckTypes(from.type, toConstraints.incoming.types, toNeighbors)) {
        console.error('The start node is an invalid incoming node for the end node.' +
            'or the maximum number of edges of this type is exceeded.');
        return false;
    }
    return true;
};

function CheckTypes(typeToCheck, typesObject, neighbors) {
    for (var type in typesObject) {
        if (typesObject.hasOwnProperty(type)) {
            if (type === "*") {
                // Any type is allowed
                return true;
            }
            if (type === typeToCheck.type) {
                var count = 0;
                // Check that maximum number of edges for this type is not exceeded.
                _.forEach(neighbors, function(node) {
                    if (node.type.type === type) {
                        count += 1;
                    }
                });
                return count < typesObject[type][1];
            }
            var index = type.indexOf("*");
            if (index > -1) {
                // This is not a leaf type.
                var actualType = type.slice(0, index-1);
                var parent = typeToCheck.GetParent();
                while (parent != null) {
                    if (parent.type === actualType) {
                        count = 0;
                        _.forEach(neighbors, function(node) {
                            parent = node.type.GetParent();
                            while (parent != null) {
                                if (parent.type === actualType) {
                                    count += 1;
                                    break;
                                }
                                parent = parent.GetParent();
                            }
                        });
                        return count < typesObject[type][1];
                    }
                    parent = parent.GetParent();
                }
            }
        }
    }
    return false;
}