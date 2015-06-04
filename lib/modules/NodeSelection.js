var _ = require('lodash');

var fv = null;

module.exports = NodeSelection;

/**
 * Tracks which node is currently selected and displays visual feedback to this end
 *
 * @param {FlowViz}     flowviz     A reference to the current instance of the FlowViz library
 */
function NodeSelection(flowviz) {
    fv = flowviz;

    this.Current = null;

    this._shadow = Snap('svg').filter(Snap.filter.shadow(0, 0, 5, "black", 0.7));

    fv.on('flowviz-ready', this._Setup);
}


//var layer = d3.select(fv.Selector)
//    .selectAll('g.selection-layer');
//
//layer.remove();
//
//layer.data([that.Current])
//    .enter()
//    .insert('g', 'g#node-group')
//    .attr('id', 'selection-layer')
//    .attr('transform', function(d) {return 'translate(' + (d.x - 20) + ',' + (d.y - 20) + ')';})
//    .append('rect');

/**
 * Attaches callbacks onto node click events so that we can track when a node is selected or deselected
 */
NodeSelection.prototype._Setup = function() {
    that = this.Selection;

    // Clear selections when the background is clicked
    d3.selectAll('svg')
        .on('click', function(data) {
            that.Clear();
        });
};

/**
 * Updates the module to reflect the fact that a new node is selected
 *
 * @param {FlowNode}    node    The newly selected node
 * @private
 */
NodeSelection.prototype.UpdateSelection = function(node, d3Select) {
    var that = this;
    this.Current = node;

    this.Clear(true);

    var req = fv.ConstraintChecker.GetRequiredTypes(node, node.getEdges(), true);
    var pos = fv.ConstraintChecker.GetPossibleTypes(node, node.getEdges(), true);
    var types = [];

    _.forEach(req, function(type) {
        types.push({
            isRequired: true,
            type: type
        })
    });

    _.forEach(pos, function(type) {
        types.push({
            isRequired: false,
            type: type
        })
    });

    console.log(types);

    if(d3Select !== undefined && d3Select !== null) {
        d3Select.append('g')
            .attr('class', 'next-nodes')
            .attr('transform', 'translate(100,0)')
            .selectAll('g.next-node')
            .data(types)
            .enter()
            .append('g')
            .attr('class', 'next-node')
            .attr('id', function(d, i) {return 'next-node-' + i;})
            .attr('transform', function(d, i) {
                return 'translate(0,' + (-100 + i * 50) + ')';
            })
            .each(function(d, i) {
                var s = Snap('g#next-node-' + i);

                var svg = d.type.getSvg();

                svg.attr('transform', 'scale(' + (d.type.scale * 0.75) + ')');
                svg.attr('opacity', 0.5);

                s.append(svg);
            });
    }

    // Add new selection
    d3.selectAll('g.flow-node')
        .each(function(d) {
            if(d === that.Current) {
                Snap(this).attr({ filter: that._shadow });
                d3.select(this).classed('selected-node', true);
            }
        });

    fv.emit('selection-changed', node);
};

/**
 * Clears any selection
 * @param emit
 * @constructor
 */
NodeSelection.prototype.Clear = function(updating) {
    if(updating === undefined) {
        updating = false;
    }

    // Clear the next possible nodes
    d3.selectAll('.next-nodes').remove();

    // Remove previous selection
    d3.select('g.selected-node')
        .each(function() {
            Snap(this).attr({ filter: null });
        })
        .classed('selected-node', false);

    if(!updating) {
        this.Current = null;
        fv.emit('selection-cleared');
    }
};