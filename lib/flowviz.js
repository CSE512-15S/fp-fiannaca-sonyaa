var Hw = require('./modules/helloworld');
var ConfigParser = require('./modules/configParser');

var FlowViz = function(config, callbacks){
    var my = {};

    my.config = new ConfigParser(config);
    my.callbacks = callbacks;

    my.run = function(selector) {
        var hw = new Hw();

        console.log('Config File: ' + config);
        hw.SayHello();
    };

    return my;
};

module.exports = FlowViz;