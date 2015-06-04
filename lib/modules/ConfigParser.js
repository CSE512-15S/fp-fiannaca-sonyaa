var _ = require('lodash');

var NodeType = require('../modules/NodeType');

var fv = null;

module.exports = ConfigParser;

/**
 * The ConfigParser class is in charge of parsing and managing the information contained within the config JSON file.
 *
 * @param {String}  config  The relative path to the JSON config file
 *
 * @constructor Uses d3.json to asynchronously load the config file. Fires 'config-ready' once the config file has been
 * loaded successfully.
 */
function ConfigParser(file, app, flowviz) {
    fv = flowviz;

    this.app = app;
    this.file = file;
    this.json = null;

    this.types = null;

    var that = this;
    d3.json(this.file, function(error, json) {
        if(error){
            return console.log(error);
        }

        that.json = that._CompleteJson(json);
        if(fv.DebugMode) console.log(that.json);

        that.types = GetTypes(that.json.types, that.json, null);
        that.primaryTypes = GetPrimaryTypes(that.types);
        that.leafTypes = GetLeafTypes(that.types);

        that.connectEvt = json.interactions["start-connection"];
        that.draggable = json.display.draggable;
        that.layout = json.display.layout;

        that.ShowDefaultMsgs = (that.json.display.messages === "default");

        fv.emit('config-ready');
    });
}

/**
 * Checks if a property of a json object is defined and if not, defines it and sets it to it's default value.
 *
 * @param {object}  json            JSON object
 * @param {string}  key             JSON key to check
 * @param {object}  defaultValue    The default value to set undefined values to
 * @returns {boolean}   returns true if the key is already defined on the JSON object
 */
ConfigParser.prototype._CheckAndDefault = function(json, key, defaultValue) {
    if(!json.hasOwnProperty(key)) {
        json[key] = defaultValue;
        return false;
    }

    return true;
};

/**
 * Checks if a JSON object has a given key. Throws an error if the JSON object is missing the key.
 *
 * @param {object}  json    JSON object
 * @param {string}  key     Key to check for
 */
ConfigParser.prototype._CheckRequired = function(json, key) {
    if(!json.hasOwnProperty(key)) {
        var msg = "You must define the key \"" + key + "\" in your config file!";
        fv.emit('config-error', msg);
        throw new Error(msg);
    }
};

/**
 * Completes an incomplete JSON config object by cascading settings from top level type declarations and by setting
 * default values for undefined settings.
 *
 * @param {object}  json    The config JSON object
 * @returns {object} Returns the completed JSON object
 */
ConfigParser.prototype._CompleteJson = function(json) {
    // "interactions" defaults to null
    this._CheckAndDefault(json, "interactions", {});
    this._CheckAndDefault(json.interactions, "start-connection", "dblclick");

    // "display" defaults to null
    this._CheckAndDefault(json, "display", {});
    this._CheckAndDefault(json.display, "messages", "default");
    this._CheckAndDefault(json.display, "draggable", true);
    this._CheckAndDefault(json.display, "layout", "right");
    this._CheckAndDefault(json.display, "scale", 1.0);

    // "types" is required
    this._CheckRequired(json, "types");

    var that = this;
    _.forEach(json.types, function(type, index, list) {
        that._CheckType(type, null);
    });


    _.forEach(json.types, function(type, index, list) {
        that._ExpandConstraints(type);
    });

    return json;
};

/**
 * Completes a type declaration based on default values and the values of the type's parent's settings
 *
 * @param {object}  type    JSON declaration of a type
 * @param {object}  parent  JSON declaration of this type's parent
 */
ConfigParser.prototype._CheckType = function(type, parent) {
    // types must have a name
    this._CheckRequired(type, "type");

    if(parent === null) {

        // Provide smart defaults if the parents are missing any settings
        this._CheckAndDefault(type, "name", type.type);
        this._CheckAndDefault(type, "desc", "No description provided in config file!");

        this._CheckAndDefault(type, "view", null);
        this._CheckAndDefault(type, "width", 0);
        this._CheckAndDefault(type, "height", 0);

        this._CheckAndDefault(type, "clickItems", null);
        this._CheckAndDefault(type, "callbacks", null);

        this._CheckAndDefault(type, "connections", null);

        this._CheckAndDefault(type, "constraints", {
            "incoming": {
                "range": [0,99],
                "types": {
                    "*": [0,99]
                }
            },
            "outgoing": {
                "range": [0,99],
                "types": {
                    "*": [0,99]
                }
            }
        });

        this._CheckAndDefault(type.constraints, "incoming", {
            "range": [0,99],
            "types": {
                "*": [0,99]
            }
        });

        this._CheckAndDefault(type.constraints, "outgoing", {
            "range": [0,99],
            "types": {
                "*": [0,99]
            }
        });

        this._CheckAndDefault(type.constraints.incoming, "range", [0,99]);
        this._CheckAndDefault(type.constraints.incoming, "types", {"*" : type.constraints.incoming.range});
        this._CheckAndDefault(type.constraints.outgoing, "range", [0,99]);
        this._CheckAndDefault(type.constraints.outgoing, "types", {"*" : type.constraints.outgoing.range});

        this._CheckAndDefault(type, "dataItems", null);
        this._CheckAndDefault(type, "subtypes", null);

    } else {
        // Chain type names with parent't type for making it easier to expand type constraints
        var tmp = type.type;
        type.type = parent.type + "." + type.type;

        // Cascade parent's settings to the children if the children are missing any settings
        this._CheckAndDefault(type, "name", tmp);
        this._CheckAndDefault(type, "desc", parent.desc);
        this._CheckAndDefault(type, "view", parent.view);
        this._CheckAndDefault(type, "width", parent.width);
        this._CheckAndDefault(type, "height", parent.height);
        this._CheckAndDefault(type, "clickItems", parent.clickItems);
        this._CheckAndDefault(type, "callbacks", parent.callbacks);

        this._CheckAndDefault(type, "connections", parent.connections);
        this._CheckAndDefault(type, "constraints", parent.constraints);
        this._CheckAndDefault(type.constraints, "incoming", parent.constraints.incoming);
        this._CheckAndDefault(type.constraints, "outgoing", parent.constraints.outgoing);
        this._CheckAndDefault(type.constraints.incoming, "range", parent.constraints.incoming.range);
        this._CheckAndDefault(type.constraints.incoming, "types", parent.constraints.incoming.types);
        this._CheckAndDefault(type.constraints.outgoing, "range", parent.constraints.outgoing.range);
        this._CheckAndDefault(type.constraints.outgoing, "types", parent.constraints.outgoing.types);

        this._CheckAndDefault(type, "dataItems", parent.dataItems);
        this._CheckAndDefault(type, "subtypes", null);
    }

    if(type.hasOwnProperty("subtypes") && type.subtypes !== null) {
        var that = this;
        _.forEach(type.subtypes, function(subtype, index, list) {
            that._CheckType(subtype, type);
        });
    } else {
        // Ensure all leaf types have a view
        if(type.view === null) {
            throw new Error(type.type + " must have a view in the config file!");
        }

        // Ensure all leaf types have a non-zero width and height
        if(type.width <= 0) {
            throw new Error(type.type + " must have a non-zero width in the config file!");
        }

        if(type.height <= 0) {
            throw new Error(type.type + " must have a non-zero height in the config file!");
        }
    }
};

/**
 * TODO: Should this be implented?
 * @param json
 * @private
 */
ConfigParser.prototype._ExpandConstraints = function(json) {

};

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
            newType.SetConnections(type.connections);
            newType.SetConstraints(type.constraints);

            output.push(newType);

            if (type.hasOwnProperty('subtypes') && type.subtypes !== null) {
                var children = GetTypes(type.subtypes, json, newType);
                newType.SetChildren(children);

                output = output.concat(children);
            }
        });
    }

    return output;
}

/**
 * Returns a list of all of the primary (top-level) types in the type hierarchy.
 *
 * @param {Array}   all     List of all types in the config file
 * @returns {Array} Returns the top level types in the hierarchy
 */
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

/**
 * Returns a list of all of the leaf (bottom-level) types in the type hierarchy.
 *
 * @param {Array}   all     List of all types in the config file
 * @returns {Array} Returns the bottom level types in the hierarchy
 */
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
    if(this.types !== null) {
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
    if(this.primaryTypes !== null) {
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
    if(this.leafTypes !== null) {
        return this.leafTypes;
    }

    return null;
};