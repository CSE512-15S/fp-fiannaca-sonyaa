//Private
var NodeType = require('../modules/NodeType');
var Inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

Inherits(ConfigParser, EventEmitter);

/**
 * Gets an svg document fragment from the view string.
 *
 * @param view (String) The view property from the config json file. Either contains a path to an svg file, or inline
 * svg code.
 */
function GetFragment(view) {
    var frag = Snap.parse(view);

    frag.select('g').attr('class', 'node-svg');

    return frag;
}

//Public
module.exports = ConfigParser;

/**
 * The ConfigParser class is in charge of parsing and managing the information contained within the config JSON file.
 *
 * @param config (String) The relative path to the JSON config file
 *
 * @constructor Uses d3.json to asynchronously load the config file. Fires 'config-ready' once the config file has been
 * loaded successfully.
 */
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

/**
 * Gets an array of NodeType objects for the types at this level of the hierarchy in the config JSON file
 *
 * @param types A reference to the current level in the types hierarchy of the config JSON file
 *
 * @returns {Array} A list of NodeType objects
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
 * Gets a list of all node types.
 *
 * @returns {Array} List of NodeType objects(@see NodeType.js)
 */
ConfigParser.prototype.getAllNodeTypes = function() {
    if(this.json != null) {
        return GetTypes(this.json.types);
    }

    return null;
};

/**
 * Gets only the top level nodes.
 *
 * TODO: ensure that subtypes can be accessed through NodeType functions
 *
 * @returns {Array} List of NodeType objects for the top level nodes (non-sub-type nodes)
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