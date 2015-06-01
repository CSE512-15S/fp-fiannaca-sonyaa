//Private
var Inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');

var NodeType = require('../modules/NodeType');

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

    this.types = null;

    var that = this;
    d3.json(this.file, function(error, json) {
        if(error){
            return console.log(error);
        }

        that.json = json;

        that.types = GetTypes(that.json.types, that.json, null);
        that.primaryTypes = GetPrimaryTypes(that.types);
        that.leafTypes = GetLeafTypes(that.types);

        that.connectEvt = json.interactions.connectEvt;
        that.draggable = json.display.draggable;
        that.layout = json.display.layout;

        that.ShowDefaultMsgs = (that.json.display.messages === "default");

        that.emit('config-ready');
    });
}

function CompleteJson(json) {
    //type is required
    //name defaults to type
    //clickItems defaults to null
    //callbacks defaults to null
}
/**
 * Gets an array of NodeType objects for the types at this level of the hierarchy in the config JSON file
 *
 * @param {object}  types   A reference to the current level in the types hierarchy of the config JSON file
 *
 * @return {Array} A list of NodeType objects
 */
function GetTypes(types, json, parent) {
    var output = [];

    if(types != null) {
        _.forEach(types, function(type) {
            var newType = new NodeType(
                type.type,
                type.name,
                type.desc,
                type.view
            );

            newType.SetWidth(type.width);
            newType.SetHeight(type.height);
            newType.SetScale(json.display.scale);
            newType.SetProperties(type.dataItems);
            newType.SetParent(parent);
            newType.SetConstraints(type.constraints);

            output.push(newType);

            if (type.hasOwnProperty('subtypes')) {
                var children = GetTypes(type.subtypes, json, newType);
                newType.SetChildren(children);

                output = output.concat(children);
            }
        });
    }

    return output;
}

function GetPrimaryTypes(all) {
    var output = [];

    if(all !== null) {
        _.forEach(all, function(type) {
            if(!type.HasParent()) {
                output.push(type);
            }
        });
    }

    return output;
}

function GetLeafTypes(all) {
    var output = [];

    if(all !== null) {
        _.forEach(all, function(type) {
            if(!type.HasChildren()) {
                output.push(type);
            }
        });
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
 * @return {Array} List of NodeType objects for the top level nodes (non-sub-type nodes)
 */
ConfigParser.prototype.getPrimaryNodesTypes = function() {
    if(this.primaryTypes != null) {
        return this.primaryTypes;
    }

    return null;
};

/**
 * Gets only the bottom level leaf nodes.
 *
 * @return {Array} List of NodeType objects for the bottom level nodes (bottom sub-type nodes)
 */
ConfigParser.prototype.getLeafNodesTypes = function() {
    if(this.leafTypes != null) {
        return this.leafTypes;
    }

    return null;
};