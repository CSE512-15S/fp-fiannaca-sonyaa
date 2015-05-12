//Private

//Public
module.exports = ConfigParser;

function ConfigParser(config) {
    this.file = config;
}

ConfigParser.prototype.SayHello = function() {
    console.log("Hello World!");
};