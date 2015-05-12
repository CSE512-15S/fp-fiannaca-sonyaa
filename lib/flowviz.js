var Hw = require('./modules/helloworld');

var FlowViz = function(config, callbacks){
    var my = {};

    my.config = config;
    my.callbacks = callbacks;

    my.run = function(selector) {
        var hw = new Hw();

        console.log('Config File: ' + config);
        hw.SayHello();
    };

    return my;
};

module.exports = FlowViz;