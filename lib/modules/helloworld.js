//Private
var privateVar = 0;

//Public
module.exports = HelloWorld;

function HelloWorld(name) {
    this.name = name;
}

HelloWorld.prototype.SayHello = function() {
    //This is an example of a public function
    console.log("Hello " + this.name + "!");
};