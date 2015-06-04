var FlowNode = require('../modules/FlowNode');
var FlowEdge = require('../modules/FlowEdge');

var fv = null;

module.exports = Renderer;

/**
 * The Renderer module is responsible for rendering to the screen the list of nodes and edges provided by the
 * GraphManager module.
 *
 * @param {object}          viz     A d3 selection for the root node of the visualization
 * @param {ConfigParser}    config  The config parser object
 *
 * @constructor Sets parameters and creates layers for the edges (at the bottom) and the nodes(at the top)
 */
function Renderer(flowviz) {
    fv = flowviz;

    //Draw the edge layer below the node layer
    var viz = d3.select(fv.Selector);

    this.edges = viz.append('g')
        .attr('id', 'edge-group');

    this.nodes = viz.append('g')
        .attr('id', 'node-group');

    this.IsRedrawing = false;

    //Objects for referencing the node and edge lists
    this.n = null;
    this.e = null;
}

/*****************************************************************************/
/* Private Section                                                           */
/*****************************************************************************/

/**
 * Draws a node by obtaining the svg description from the node's type and appending it to the node's location in the
 * DOM scenegraph.
 *
 * @param {FlowNode}    d   The current node in a d3 selection
 * @param {number}      i   The index of the current node
 */
function DrawNode(d, i) {
    var s = Snap('g#flow-node-' + i);

    var svg = d.type.getSvg();

    svg.attr('transform', 'scale(' + d.type.scale + ')');

    s.append(svg);
}

/**
 * d3 utility for creating SVG paths from an array of points. This is used to generate the edges.
 */
var DrawLine = d3.svg.line()
    .x(function(d) {return d.x;})
    .y(function(d) {return d.y;})
    .interpolate('monotone');

/**
 * Draws the path of an edge between two nodes.
 *
 * @param {object}  d    d3 data object
 * @param {object}  i    d3 data object index
 */
function DrawEdgePath(d, i) {
    d.setSvgPath(DrawLine(d.getPath()));

    d3.select('path#flow-edge-path-' + i)
        .attr('d', d.getSvgPath())
        .attr('class', 'flow-edge-path');
}

/**
 * Draws a larger invisible region over an edge so that the edge can be interacted with
 * @param {FlowEdge}    d   Current FlowEdge object
 * @param {number}      i   Data item index
 */
function DrawEdgeRegion(d, i) {
    d3.select('path#flow-edge-region-' + i)
        .attr('d', d.getSvgPath())
        .attr('class', 'flow-edge-region')
        .on('dblclick', function(d, i) {
            d3.event.sourceEvent.stopPropagation();
            d.direction = (d.direction + 1) % FlowEdge.TOTAL_DIRS;
            fv.Renderer.RedrawEdges();
        });
}

/**
 * Draws the forward tip on an edge.
 *
 * In the previous version, this could either have been arrow heads in the forward and/or backward directions, or dots
 * indicating no direction. In the current version, only forward arrows are allowed.
 *
 * @param {FlowNode}  d   d3 data object
 * @param {number}    i   d3 data object index
 */
function DrawEdgeTips(d, i) {
    d3.select('g#flow-edge-tip-' + i)
        .append('path')
        .attr('d', DrawLine(d.getForwardTip()))
        .attr('class', 'flow-edge-tip forward');
}

/**
 * Updates all of the edges in the update set.
 *
 * @param {Array}   updateSet   A d3 selection of all of the edges in the edge layer
 */
function UpdateEdges(updateSet) {
    // Update edge paths
    updateSet.selectAll('path.flow-edge-path')
        .each(function(d) {d.setSvgPath(DrawLine(d.getPath()));})
        .attr('d', function(d) {return d.getSvgPath();});

    updateSet.selectAll('path.flow-edge-region')
        .attr('d', function(d) {return d.getSvgPath();});

    // Update tips (arrow heads)
    updateSet.selectAll('g g path.forward')
        .attr('d', function(d) {return DrawLine(d.getForwardTip());});
}

/**
 * A d3 behavior which enables the ability to drag nodes in the graph.
 */
var drag = d3.behavior.drag()
    .origin(function(d) { return d; })
    .on("drag", function(d){
        fv.GraphManager.MoveNode(d, d.x = d3.event.x, d.y = d3.event.y);
    });

/*****************************************************************************/
/* Public Section                                                            */
/*****************************************************************************/

/**
 * Sets this object's reference to the GraphManager's list of nodes. This should only be called once: in the
 * GraphManager's constructor!
 *
 * @param {object}  list    A list of the nodes
 */
Renderer.prototype.SetNodeListRef = function(list) {
    this.n = list;
};

/**
 * Sets this object's reference to the GraphManager's list of edges. This should only be called once: in the
 * GraphManager's constructor!
 *
 * @param {object}  list    A list of the edges
 */
Renderer.prototype.SetEdgeListRef = function(list) {
    this.e = list;
};

/**
 * Updates, creates, and removes edges.
 */
Renderer.prototype.RenderEdges = function() {
    // Get the update set
    var edges = this.edges
        .selectAll('g.flow-edge')
        .data(this.e);

    // Run updates
    UpdateEdges(edges);

    // Exit set
    edges.exit().remove();

    // Enter Set
    var arrow = edges.enter()
        .append('g')
        .attr('class', 'flow-edge')
        .on('click', function(d, i) {
            if (d3.event.ctrlKey) {
                fv.Renderer.StartRedraw();
                fv.GraphManager.RemoveEdge(d);
            }
        });

    arrow.append('path')
        .attr('id', function(d, i) {return 'flow-edge-path-' + i;})
        .each(DrawEdgePath);

    arrow.append('path')
        .attr('id', function(d, i) {return 'flow-edge-region-' + i;})
        .each(DrawEdgeRegion);

    arrow.append('g')
        .attr('id', function(d, i) {return 'flow-edge-tip-' + i;})
        .each(DrawEdgeTips);
};

/**
 * Updates, creates, and removes nodes.
 */
Renderer.prototype.RenderNodes = function() {
    // Selection
    var nodes = this.nodes
        .selectAll('g.flow-node')
        .data(this.n);

    // Update set
    nodes.attr('transform', function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
    });

    // Exit set
    nodes.exit().remove();

    // Enter Set
    var node = nodes.enter()
        .append('g')
        .attr('class', 'flow-node')
        .attr('id', function(d, i) {return 'flow-node-' + i;})
        .attr('transform', function(d) {return 'translate(' + d.x + ',' + d.y + ')';})
        .on(fv.Config.connectEvt, function(d) {
            fv.Selection.Clear(true);
            fv.GraphManager.StartConnection(d, d3.event.x, d3.event.y);
        })
        .on('click', FlowNodeClick)
        .each(DrawNode);

    if(fv.Config.draggable) {
        node.call(drag);
    }
};

function FlowNodeClick(d, i) {
    // When there is a selected node, stop the click propagation
    if(fv.Selection.Current !== null) {
        d3.event.stopPropagation();
    }

    d3.selectAll('.next-node').remove();

    // Dragging shouldn't change a selection
    if (d3.event.defaultPrevented) return;

    // If ctrl is down, remove the node, otherwise, select it
    if (d3.event.ctrlKey) {
        fv.Renderer.StartRedraw();
        fv.GraphManager.RemoveNode(d);
    } else {
        fv.Selection.UpdateSelection(d, d3.select(this));
        d3.event.stopPropagation();

        this.wasDragging = false;
    }
}

/**
 * The main rendering function. This function renders the graph to the screen and updates the previously rendered
 * version of the graph.
 */
Renderer.prototype.Update = function() {
    this.RenderEdges();
    this.RenderNodes();

    if(this.IsRedrawing) {
        this.IsRedrawing = false;
        fv.emit('renderer-redrawn');
    } else {
        fv.emit('renderer-updated');
    }
};

/**
 * Begins the process of completely redrawing the visualization by reinitializing the scenegraph. Note that after calling
 * this, new data may be added, and then Renderer.Update() must be called to actually draw the visualization.
 */
Renderer.prototype.StartRedraw = function() {
    fv.Selection.Clear();

    d3.select(fv.Selector).selectAll('g').remove();

    //Draw the edge layer below the node layer
    var viz = d3.select(fv.Selector);

    this.edges = viz.append('g')
        .attr('id', 'edge-group');

    this.nodes = viz.append('g')
        .attr('id', 'node-group');

    this.IsRedrawing = true;
};

/**
 * Method for redrawing edges in the event that any property of the edge needs to change other than the start and end
 * positions.
 */
Renderer.prototype.RedrawEdges = function() {
    d3.selectAll('g.flow-edge').remove();
    this.RenderEdges();
};

/**
 * Updates the temporary node and edge that are used for depicting the creation of new edges in the graph
 *
 * @param {FlowNode}    tmpNode     A dummy node used for tracking the current mouse location
 * @param {FlowEdge}    tmpEdge     The edge that is being created
 */
Renderer.prototype.DrawConnection = function(tmpNode, tmpEdge) {
    this.edges
        .append('g')
        .datum(tmpEdge)
        .attr('class', 'flow-edge-temp')
        .append('path')
        .attr('class', 'flow-edge-tmp-path')
        .attr('d', function(d) {
            return DrawLine(d.getPath());
        })
        .attr('stroke-dasharray', '5,5')
        .attr('stroke', 'black')
        .attr('stroke-width', 3)
        .attr('fill', 'none');

    // Enter Set
    this.nodes
        .append('g')
        .datum(tmpNode)
        .attr('class', 'flow-node-temp')
        .attr('transform', function(d) {return 'translate(' + d.x + ',' + d.y + ')';})
        .each(function(d) {
            $(document).on('mousemove', function(evt) {
                d3.select('g.flow-node-temp')
                    .attr('transform', function(d) {
                        d.x = evt.offsetX;
                        d.y = evt.offsetY;
                        return 'translate(' + d.x + ',' + d.y + ')';
                    });

                d3.select('g.flow-edge-temp')
                    .each(function(d) {
                        d.Update();
                    })
                    .select('path')
                    .attr('d', function(d) {
                        return DrawLine(d.getPath());
                    });
            });
        })
        .each(function(d) {
            // Clicking something other than a node, should cancel the new edge creation
            $(document).on('click', function(e) {
                fv.GraphManager.EndConnection(null);
                RemoveTempListeners();
            });
        });

    d3.selectAll('g.flow-node')
        .on('click', null);

    // Only allow connections to end on other pre-existing nodes
    d3.selectAll('g.flow-node')
        .on('click', function(d) {
            fv.GraphManager.EndConnection(d);
            RemoveTempListeners();
        });
};

/**
 * Removes the event listeners that are involved in the process of generating new edges in the graph.
 */
function RemoveTempListeners() {
    $(document).off('click');

    d3.selectAll('g.flow-node')
        .on('click', null);

    d3.selectAll('g.flow-node')
        .on('click', FlowNodeClick);
}

/**
 * Removes the temporary node and edge that are added to the graph when a new edge is being created.
 */
Renderer.prototype.RemoveTempParts = function() {
    this.edges
        .select('g.flow-edge-temp')
        .remove();

    this.nodes
        .select('g.flow-node-temp')
        .remove();
};