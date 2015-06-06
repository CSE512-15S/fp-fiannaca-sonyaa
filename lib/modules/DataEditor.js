var _ = require('lodash');

var fv = null;

module.exports = DataEditor;

function DataEditor(flowviz) {
    fv = flowviz;
}

DataEditor.prototype.Create = function(selector) {
    d3.select(selector)
        .append('div')
        .attr('class', 'data-editor')
        .append('h1')
        .text("Data Editor");
};

DataEditor.prototype.Show = function(edge) {
    d3.select('.data-editor')
        .selectAll('.data-item')
        .remove();

    var items = [];
    if(edge === undefined) {
        _.forEach(fv.Selection.Current.DataItems, function(item, key) {
            items.push({
                "key": key,
                "value": item
            });
        });
    } else {
        _.forEach(edge.DataItems, function(item, key) {
            items.push({
                "key": key,
                "value": item
            });
        });
    }

    if(items.length > 0) {
        var items = d3.select('.data-editor')
            .selectAll('.data-item')
            .data(items)
            .enter()
            .append('div')
            .attr('class', 'data-item')
            .each(function (d, i) {
                if (d.value.type === "string") {
                    var item = d3.select(this);
                    item.append('span')
                        .attr('class', 'data-label')
                        .text(d.value.desc);

                    item.append('input')
                        .attr('class', 'data-str-input')
                        .attr('id', 'data-str-input-' + i)
                        .call(function () {
                            $('#data-str-input-' + i).val(d.value.value);
                            $('#data-str-input-' + i).on('change keyup paste input', function () {
                                console.log($(this).val());
                                if(!fv.Selection.Current.SetDataItem(d.key,$(this).val())) {
                                    $(this).addClass('data-item-error');
                                } else {
                                    $(this).removeClass('data-item-error');
                                }
                            });
                        });
                } else {
                    var item = d3.select(this);
                    item.append('span')
                        .attr('class', 'data-label')
                        .text(d.value.desc);

                    item.append('input')
                        .attr('class', 'data-num-input')
                        .attr('id', 'data-num-input-' + i)
                        .call(function () {
                            $('#data-num-input-' + i).val(d.value.value);
                            $('#data-num-input-' + i).on('change keyup paste input', function () {
                                var selected = (edge === undefined) ? fv.Selection.Current : edge;
                                if(!selected.SetDataItem(d.key,+$(this).val())) {
                                    $(this).addClass('data-item-error');
                                } else {
                                    $(this).removeClass('data-item-error');
                                }
                            });
                        });
                }
            });

        d3.select('.data-editor').classed('node-selected', true);

    } else {
        this.Hide();
    }
};

DataEditor.prototype.Hide = function() {
    d3.select('.data-editor')
        .classed('node-selected', false);

    d3.select('.data-editor')
        .selectAll('.data-item')
        .remove();
};