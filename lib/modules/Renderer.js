//Private
var Inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

Inherits(Renderer, EventEmitter);

//Public Interface
module.exports = Renderer;

//Constructor
function Renderer(config) {
    this.config = config;
}

Renderer.prototype.Update = function(selector) {

};
