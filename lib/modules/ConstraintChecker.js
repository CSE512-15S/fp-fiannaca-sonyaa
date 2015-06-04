var _ = require('lodash');

var fv = null;

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
 * @param {FlowNode}    from    The starting node of an edge
 * @param {FlowNode}    to      The ending node of an edge
 * @param {object}      edges   The list of edges in the graph
 */
ConstraintChecker.prototype.IsValidEdge = function(from, to, edges) {
    var fromConstraints = from.type.GetConstraintObject();
    var toConstraints = to.type.GetConstraintObject();

    // Collect all nodes are connected to "from" or "to".
    var fromNeighbors = [];
    var toNeighbors = [];

    _.forEach(edges, function (edge) {
        if (edge.start === from) {
            fromNeighbors.push(edge.end);
        }
        if (edge.end === to) {
            toNeighbors.push(edge.start);
        }
        // We don't check if edge from "from" to "to" already exists, that is done elsewhere.
    });

    var msg = "";

    // Check that number of edges from "from" is not at maximum yet.
    if (fromNeighbors.length >= fromConstraints.outgoing.range[1]) {
        msg = 'The start node already has maximum number of outgoing edges.';
        fv.ShowWarning(msg);
        console.error(msg);
        return false;
    }
    // Check that number of edges to "to" is not at maximum yet.
    if (toNeighbors.length >= toConstraints.incoming.range[1]) {
        msg = 'The end node already has maximum number of incoming edges.';
        fv.ShowWarning(msg);
        console.error(msg);
        return false;
    }
    // Check that "to" type is an allowable type for "from"
    // and that "from" hasn't exceeded the limit of neighbors of type "to".
    if (!CheckTypes(to.type, fromConstraints.outgoing.types, fromNeighbors)) {
        msg = 'The end node is an invalid outgoing node for the start node ' +
            'or the maximum number of edges of this type is exceeded.';
        fv.ShowWarning(msg);
        console.error(msg);
        return false;
    }
    // Check that "from" type is an allowable type for "to"
    // and that "to" hasn't exceeded the limit of neighbors of type "from".
    if (!CheckTypes(from.type, toConstraints.incoming.types, toNeighbors)) {
        msg = 'The start node is an invalid incoming node for the end node.' +
            'or the maximum number of edges of this type is exceeded.';
        fv.ShowWarning(msg);
        console.error(msg);
        return false;
    }
    return true;
};

ConstraintChecker.prototype.IsValidGraph = function(nodes, edges) {
    var incomingEdges = {};
    var outgoingEdges = {};
    _.forEach(edges, function(edge) {
        incomingEdges[edge.end] = edge;
        outgoingEdges[edge.start] = edge;
    });
    var msg = "";
    _.forEach(nodes, function(node) {
        var constraints = node.type.GetConstraintObject();
        var incoming = node in incomingEdges ? incomingEdges[node] : [];
        var outgoing = node in outgoingEdges ? outgoingEdges[node] : [];
        if (incoming.length < constraints.incoming.range[0]) {
            msg = 'Node of type ' + node.type.name + ' has too few incoming edges.';
            fv.ShowWarning(msg);
            console.error(msg);
            return false;
        } else if (incoming.length > constraints.incoming.range[1]) {
            msg = 'Node of type ' + node.type.name + ' has too many incoming edges.';
            fv.ShowWarning(msg);
            console.error(msg);
            return false;
        }
        if (outgoing.length < constraints.outgoing.range[0]) {
            msg = 'Node of type ' + node.type.name + ' has too few outgoing edges.';
            fv.ShowWarning(msg);
            console.error(msg);
            return false;
        } else if (incoming.length > constraints.outgoing.range[1]) {
            msg = 'Node of type ' + node.type.name + ' has too many outgoing edges.';
            fv.ShowWarning(msg);
            console.error(msg);
            return false;
        }
    });
    if (msg !== "") {
        return false;
    }
    return true;
};

/**
 * Get the types of nodes that are required to be connected to this node.
 *
 * @param {FlowNode}    node    The node for which to get the types
 * @param {object}      edges   The list of edges in the graph
 * @param {bool}        isOutgoing  If true, return outgoing types, otherwise return incoming.
 * @return {object}    List of NodeType objects corresponding to required nodes
 */
ConstraintChecker.prototype.GetRequiredTypes = function(node, edges, isOutgoing) {
    return GetMissingTypes(node, edges, isOutgoing, true);
};

/**
 * Get the types of nodes that could be connected to this node.
 *
 * @param {FlowNode}    node    The node for which to get the types
 * @param {object}      edges   The list of edges in the graph
 * @param {bool}        isOutgoing  If true, return outgoing types, otherwise return incoming.
 * @return {object}    List of NodeType objects corresponding to possible nodes
 */
ConstraintChecker.prototype.GetPossibleTypes = function(node, edges, isOutgoing) {
    return GetMissingTypes(node, edges, isOutgoing, false);
};

/**
 * Checks if the types of start and end nodes on a given edge meet the specified constraints
 *
 * @param {NodeType}    typeToCheck     NodeType to verify
 * @param {object}      typesObject     Types object specified in the constraints section of the config JSON object
 * @param {Array}       neighbors       List of current neighbors for the current node
 * @return {boolean}    True if the neighbors are all valid given the constraints for this NodeType
 */
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


/**
 * Get the types of nodes that can or should be connected to this node.
 *
 * @param {FlowNode}    node    The node for which to get the types
 * @param {object}      edges   The list of edges in the graph
 * @param {bool}        isOutgoing  If true, return outgoing types, otherwise return incoming.
 * @param {bool}        isRequired  If true, return required types, otherwise return possible.
 * @return {object}    List of NodeType objects corresponding to required nodes
 */
function GetMissingTypes(node, edges, isOutgoing, isRequired) {
    var constraints = isOutgoing ? node.type.GetConstraintObject().outgoing : node.type.GetConstraintObject().incoming;
    var neighbors = [];
    var neighborCountByTypeName = {};

    _.forEach(edges, function (edge) {
        if (edge.start === node && isOutgoing) {
            neighbors.push(edge.end);
            if (!(edge.end.type in neighborCountByTypeName)) {
                neighborCountByTypeName[edge.end.type.type] = 0;
            }
            neighborCountByTypeName[edge.end.type.type] += 1;
        }
        if (edge.end === node && !isOutgoing) {
            neighbors.push(edge.start);
            if (!(edge.start.type in neighborCountByTypeName)) {
                neighborCountByTypeName[edge.start.type.type] = 0;
            }
            neighborCountByTypeName[edge.start.type.type] += 1;
        }
    });

    // Check if node already has max number of neighbors.
    if (neighbors.length >= constraints.range[1]) {
        return [];
    }

    var typeNameToType = {};
    _.forEach(fv.Config.getAllNodeTypes(), function(t) {
        typeNameToType[t.type] = t;
    });
    var possibleTypes = [];
    var typesObject = constraints.types;
    for (var type in typesObject) {
        if (typesObject.hasOwnProperty(type)) {
            if (type === "*") {
                // Any type is allowed
                if (neighbors.length < typesObject[type][1]) {
                    if (!isRequired ||
                        (isRequired && neighbors.length < Math.max(constraints.range[0], typesObject[type][0]))) {
                        return fv.Config.getLeafNodesTypes();
                    } else {
                        return [];
                    }
                } else {
                    return [];
                }
            }
            var index = type.indexOf("*");
            if (index > -1) {
                // This is not a leaf type.
                var actualType = typeNameToType[type.slice(0, index - 1)];
                // Get all leaves that correspond to this parent type.
                var childLeaves = [];
                function getChildLeaves(n) {
                    var children = n.GetChildren();
                    if (children == null) {
                        childLeaves.push(n);
                        return;
                    }
                    _.forEach(children, getChildLeaves);
                }
                getChildLeaves(actualType);
                // Sum up all neighbors that are amongst the child leaves
                var count = 0;
                for (var neighborType in neighborCountByTypeName) {
                    if (neighborCountByTypeName.hasOwnProperty(neighborType)) {
                        if (childLeaves.indexOf(typeNameToType[neighborType]) > -1) {
                            count += neighborCountByTypeName[neighborType];
                        }
                    }
                }
                // If max number of edges is not exceeded, any of the child leaves is a possible neighbor
                if (count < typesObject[type][1]) {
                    if (!isRequired) {
                        possibleTypes = possibleTypes.concat(childLeaves);
                    } else {
                        if (count < typesObject[type][0] || neighbors.length < constraints.range[0]) {
                            possibleTypes = possibleTypes.concat(childLeaves);
                        }
                    }
                }
            } else {
                // Leaf type
                if (!(type in neighborCountByTypeName) || neighborCountByTypeName[type] < typesObject[type][1]) {
                    if (!isRequired) {
                        possibleTypes.push(typeNameToType[type]);
                    } else {
                        if ( (type in neighborCountByTypeName && neighborCountByTypeName[type] < typesObject[type][0])
                            || (!(type in neighborCountByTypeName) && typesObject[type][0] > 0)
                            || neighbors.length < constraints.range[0]) {
                            possibleTypes.push(typeNameToType[type]);
                        }
                    }
                }
            }
        }
    }
    return possibleTypes;
}