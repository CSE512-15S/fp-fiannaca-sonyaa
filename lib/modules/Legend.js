//Private
var Inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

Inherits(Legend, EventEmitter);

//Public Interface
module.exports = Legend;

//Constructor
function Legend(config) {
    this.config = config;
}

Legend.prototype.Create = function(selector) {
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

            var frag = Snap.parse(d.description.view);
            frag.select('g')
                .attr('class', 'node-svg');

            s.append(frag);
        });

    //Add info to each legend item
    var LegendInfo = LegendItem.append('div')
        .attr('id', function(d, i) {return 'item-info-' + i;})
        .attr('class', 'item-info');

    LegendInfo.append('h3')
        .text(function(d) {return d.description.name;});

    LegendInfo.append('p')
        .text(function(d) {return d.description.desc;});
};
