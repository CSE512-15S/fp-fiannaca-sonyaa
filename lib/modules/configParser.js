//Private

//Public
module.exports = ConfigParser;

function ConfigParser(config) {
    this.file = config;
    this.json = null;
    this.configName = null;

    var that = this;
    d3.json(this.file, function(error, json) {
        if(error) return console.warn(error);

        that.json = json;
        that.configName = json.name;
    });
}

/**
 * Gets a list of all node types
 *
 * Returns a list of NodeType objects(@see NodeType.js)
 */
ConfigParser.prototype.getAllNodeTypes = function() {
    if(this.json != null) {
        for(var types in json.types) {

        }
    }
};

/**
 * Gets only the top level nodes; however, note that subtypes can be accessed through NodeType functions
 *
 * Returns a list of NodeType objects for the top level nodes (non-sub-type nodes)
 */
ConfigParser.prototype.getPrimaryNodesTypes = function() {

};