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

    var divs = d3.select(selector)
        .selectAll('div')
        .data(nodes)
        .enter()
        .append('div')
        .attr('class', 'legend-item');

    divs.append('svg')
        .attr('id', function(d, i) {
            return "item-svg-" + i;
        })
        //Use .each() to add the svg to each node with Snap.js
        .each(function(d,i) {
            var s = Snap('#item-svg-' + i); //id created in the previous call

            var frag = Snap.parse(d.description.view);
            frag.select('g')
                .attr('transform', 'scale(0.8)') // translate(0,' + (i * (100 / 0.8)) + ')';
                .attr('class', 'node-svg');

            s.append(frag);
        });

    divs.append('div')
        .attr('class', function(d, i) {return 'item-info-' + i;})
        .append('h3')
        .text(function(d) {return d.description.name;});
};
