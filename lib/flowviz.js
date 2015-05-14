//Private
var ConfigParser = require('./modules/ConfigParser');

//Public
module.exports = FlowViz;

function FlowViz(config, callbacks){
    this.config = new ConfigParser(config);
    this.callbacks = callbacks;
}

FlowViz.prototype.run = function(selector) {
    console.log('Config File: ' + this.config.file);

    d3.select(selector)
        .append('rect')
        .attr('x', 20)
        .attr('y', 20)
        .attr('width', 40)
        .attr('height', 40)
        .attr('fill', 'red');
};

FlowViz.prototype.getNodeTypes = function() {
    return this.config.getNodeTypes();
};