//Private
var NodeType = require('../modules/NodeType');
var Inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

Inherits(ConfigParser, EventEmitter);

function GetFragment(view) {
    var frag = Snap.parse(view);

    frag.select('g').attr('class', 'node-svg');

    return frag;
}

//Public
module.exports = ConfigParser;

function ConfigParser(config) {
    this.file = config;
    this.json = null;
    this.configName = null;

    var that = this;
    d3.json(this.file, function(error, json) {
        if(error){
            return console.log(error);
        }

        that.json = json;
        that.configName = json.name;

        that.emit('config-ready');
    });
}

function GetTypes(types) {
    var output = [];

    if(types != null) {
        for(var type in types) {
            if(types.hasOwnProperty(type)) {
                output.push(new NodeType(
                    types[type].type,
                    types[type].name,
                    types[type].desc,
                    GetFragment(types[type].view)
                ));

                if (types[type].hasOwnProperty('subtypes')) {
                    output = output.concat(GetTypes(types[type].subtypes));
                }
            }
        }
    }

    return output;
}

/**
 * Gets a list of all node types
 *
 * Returns a list of NodeType objects(@see NodeType.js)
 */
ConfigParser.prototype.getAllNodeTypes = function() {
    if(this.json != null) {
        return GetTypes(this.json.types);
    }

    return null;
};

/**
 * Gets only the top level nodes; however, note that subtypes can be accessed through NodeType functions
 *
 * Returns a list of NodeType objects for the top level nodes (non-sub-type nodes)
 */
ConfigParser.prototype.getPrimaryNodesTypes = function() {
    var output = [];

    if(json != null) {
        for(var type in this.json.types) {
            if(this.json.types.hasOwnProperty(type)) {
                output.push(new NodeType(
                    this.json.types[type].type,
                    this.json.types[type].name,
                    this.json.types[type].desc,
                    GetFragment(this.json.types[type].view)
                ));
            }
        }
    }

    return output;
};