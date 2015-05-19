//Private
var NodeType = require('../modules/NodeType');
var Inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

Inherits(ConfigParser, EventEmitter);

//Public
module.exports = ConfigParser;

/**
 * The ConfigParser class is in charge of parsing and managing the information contained within the config JSON file.
 *
 * @param {String}  config  The relative path to the JSON config file
 *
 * @constructor Uses d3.json to asynchronously load the config file. Fires 'config-ready' once the config file has been
 * loaded successfully.
 */
function ConfigParser(config) {
    this.file = config;
    this.json = null;
    this.configName = null;

    this.types = null;

    var that = this;
    d3.json(this.file, function(error, json) {
        if(error){
            return console.log(error);
        }

        that.json = json;
        that.configName = json.name;

        that.types = GetTypes(that.json.types);

        that.connectEvt = json.connectEvt;
        that.draggable = json.draggable;

        that.emit('config-ready');
    });
}

/**
 * Gets an array of NodeType objects for the types at this level of the hierarchy in the config JSON file
 *
 * @param {object}  types   A reference to the current level in the types hierarchy of the config JSON file
 *
 * @return {Array} A list of NodeType objects
 */
function GetTypes(types) {
    var output = [];

    if(types != null) {
        for(var type in types) {
            if(types.hasOwnProperty(type)) {
                output.push(new NodeType(
                    types[type].type,
                    types[type].name,
                    types[type].desc,
                    types[type].view
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
 * Gets a list of all node types. Only a single copy of the list of NodeType objects is ever created. This function
 * just returns a reference to this single list. Note: this can only be called after the 'config-ready' event has
 * fired.
 *
 * @return {Array} List of NodeType objects(@see NodeType.js)
 */
ConfigParser.prototype.getAllNodeTypes = function() {
    if(this.types != null) {
        return this.types;
    }

    return null;
};

/**
 * Gets only the top level nodes.
 *
 * TODO: ensure that subtypes can be accessed through NodeType functions
 *
 * @return {Array} List of NodeType objects for the top level nodes (non-sub-type nodes)
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
                    this.json.types[type].view
                ));
            }
        }
    }

    return output;
};