var _ = require('lodash');

var fv = null;

module.exports = Legend;

/**
 * This class creates a default legend. FlowViz users can opt to not use this implementation of the legend and instead
 * create their own.
 *
 * @param {FlowViz}  flowviz    A reference to the main FlowViz object
 *
 * @constructor Simply sets parameters for the time being
 */
function Legend(flowviz) {
    fv = flowviz;
}

/**
 * Uses d3 to generate the default legend.
 *
 * @param {String}  selector    The div in which the legend should be created
 */
Legend.prototype.Create = function(selector) {
    d3.select(selector)
        .append('h1')
        .text("Program Blocks");

    // Add legend items
    var nodes = fv.Config.getLeafNodesTypes();

    var LegendItem = d3.select(selector)
        .selectAll('div')
        .data(nodes)
        .enter()
        .append('div')
        .attr('class', 'legend-item row')
        .attr('style', 'position:relative;')
        .attr('id', function(d, i) {return 'legend-item-' + i;});

    //Add SVG to each legend item
    LegendItem.each(function(d,i) {
            var s = Snap('#legend-item-' + i); //id created in the previous call
            s.append(d.getRawSvg());
        });

    // Add node on double-click, using auto layout.
    LegendItem.on('dblclick', function(d, i) {
        fv.GraphManager.AddNodeAutoLayout(d);
    });

    // Use draggabilly to make drag-and-drop work from the legend to the main interface
    var xOffset = 0;
    var yOffset = 0;

    var $draggable = $('.legend-item svg').draggabilly();
    $draggable.on( 'dragStart', function(evt, ptr) {
        xOffset = ptr.layerX;
        yOffset = ptr.layerY;

        $(evt.target).clone()
            .attr('id','drag-stub')
            .attr('style','position:absolute; top:0; left:0;')
            .removeClass('is-pointer-down is-dragging')
            .insertAfter(evt.target);
    });
    $draggable.on( 'dragEnd', function(evt, ptr) {
        $('#drag-stub').remove();
        $(evt.target).attr('style', 'position:relative;');

        var offset = ptr.layerX - ($('#LeftSidebar').width());

        if(offset >= 0) {
            var nodeType = d3.select(evt.target.parentNode).datum();
            fv.GraphManager.AddNode(nodeType, offset - xOffset, ptr.pageY - yOffset);
        }
    });

    //Add info to each legend item
    var LegendInfo = LegendItem.append('div')
        .attr('id', function(d, i) {return 'item-info-' + i;})
        .attr('class', 'item-info');

    LegendInfo.append('h4')
        .text(function(d) {return d.name;});

    LegendInfo.append('p')
        .text(function(d) {return d.desc;});
};
