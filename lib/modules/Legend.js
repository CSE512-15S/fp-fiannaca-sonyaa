//Private
var Inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

Inherits(Legend, EventEmitter);

//Public Interface
module.exports = Legend;

/**
 * This class creates a default legend. FlowViz users can opt to not use this implementation of the legend and instead
 * create their own.
 *
 * @param {ConfigParser}  config    A reference to the ConfigParser object
 * @param {GraphManager}  manager    A reference to the GraphManager object
 *
 * @constructor Simply sets parameters for the time being
 */
function Legend(config, manager) {
    this.config = config;
    this.manager = manager;
}

/**
 * Uses d3 to generate the default legend.
 *
 * @param {String}  selector    The div in which the legend should be created
 */
Legend.prototype.Create = function(selector) {
    var that = this;
    var nodes = this.config.getAllNodeTypes();

    var LegendItem = d3.select(selector)
        .selectAll('div')
        .data(nodes)
        .enter()
        .append('div')
        .attr('class', 'legend-item row')
        .attr('id', function(d, i) {return 'legend-item-' + i;});

    //Add SVG to each legend item
    LegendItem.each(function(d,i) {
            var s = Snap('#legend-item-' + i); //id created in the previous call
            s.append(d.svg);
        });

    // Add node on double-click, using auto layout.
    LegendItem.on('dblclick', function(d, i) {
        that.manager.AddNodeAutoLayout(d);
    });

    // Add node on drag-and-drop.
    var drag = d3.behavior.drag()
        .on("drag", function(d){
            d.x = d3.event.x;
            d.y = d3.event.y;
        })
        .on("dragend", function(d){
            if (!d.x || !d.x) {
                // If the node doesn't have coordinates, that means the drag wasn't performed.
                return;
            }
            that.manager.AddNode(d, d.x, d.y);
        });
    LegendItem.call(drag);

    //Add info to each legend item
    var LegendInfo = LegendItem.append('div')
        .attr('id', function(d, i) {return 'item-info-' + i;})
        .attr('class', 'item-info');

    LegendInfo.append('h3')
        .text(function(d) {return d.name;});

    LegendInfo.append('p')
        .text(function(d) {return d.desc;});
};
