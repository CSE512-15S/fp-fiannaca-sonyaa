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
NodeSelection.prototype.UpdateSelection = function(node) {
    var that = this;
    this.Current = node;

    this.Clear(true);

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