//Private
var Hw = require('./modules/helloworld');
var ConfigParser = require('./modules/configParser');

//Public
module.exports = FlowViz;

function FlowViz(config, callbacks){
    this.config = new ConfigParser(config);
    this.callbacks = callbacks;
}

FlowViz.prototype.run = function(selector) {
    var hw = new Hw('World');

    console.log('Config File: ' + this.config.file);
    hw.SayHello();

    d3.select(selector)
        .append('rect')
        .attr('x', 20)
        .attr('y', 20)
        .attr('width', 40)
        .attr('height', 40)
        .attr('fill', 'red');
};