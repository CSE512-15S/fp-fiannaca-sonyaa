function HelloWorld() {
    this.SayHello = function() {
        console.log("Hello World!");
    };
}

HelloWorld.prototype.staticFunction = function() {
    //This is an example of a static function
};

module.exports = HelloWorld;