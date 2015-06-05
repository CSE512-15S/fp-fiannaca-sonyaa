var _ = require('lodash');

var fv = null;

module.exports = Controls;

/**
 *
 *
 * @param {FlowViz}  flowviz    A reference to the main FlowViz object
 *
 * @constructor Simply sets parameters for the time being
 */
function Controls(flowviz) {
    fv = flowviz;
}

/**
 * Uses d3 to generate the default controls section.
 *
 * @param {String}  selector    The div in which the controls should be created
 */
Controls.prototype.Create = function(selector) {
    d3.select(selector)
        .append('h1')
        .text("Controls");

    // Add buttons for saving, auto-layout, and validation
    d3.select(selector)
        .append('button')
        .attr('class', 'legend-btn save-graph')
        .attr('style', 'position:relative;')
        .text('Save/Download Program')
        .on('click', function () {
            fv.GraphManager.Save();
        });

    d3.select(selector)
        .append('button')
        .attr('class', 'legend-btn')
        .attr('style', 'position:relative;')
        .text('Validate graph')
        .on('click', function () {
            if (fv.ConstraintChecker.IsValidGraph(fv.GraphManager.nodes, fv.GraphManager.edges)) {
                fv.ShowMessage('Graph is valid!');
            }
        });

    d3.select(selector)
        .append('button')
        .attr('class', 'legend-btn')
        .attr('style', 'position:relative;')
        .text('Auto-layout')
        .on('click', function () {
            fv.Layout.AutoLayout(fv.GraphManager.nodes, fv.GraphManager.edges);
            fv.Renderer.Update();
        });

    d3.select(selector)
        .append('button')
        .attr('class', 'legend-btn')
        .attr('style', 'position:relative;')
        .text('Autocomplete')
        .on('click', function() {
            fv.GraphManager.AutoCompleteAll();
        });

    d3.select(selector)
        .append('button')
        .attr('class', 'legend-btn')
        .attr('style', 'position:relative;')
        .text('Autocomplete all!')
        .on('click', function() {
            var hasNew = fv.GraphManager.AutoCompleteAll();
            while (hasNew) {
                hasNew = fv.GraphManager.AutoCompleteAll();
            }
        });
};