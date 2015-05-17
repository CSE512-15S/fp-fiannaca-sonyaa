/***********************************************************/
/* Private Static Section                                  */
/***********************************************************/

// Node.Js Style Module Includes
var Inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

// Set up this module for emitting events
Inherits(ModuleName, EventEmitter);

// Define private static functions like this
function OtherFunction() {
    // Private Static Function
}

// Define private static variables like this
var anotherVar = null;

/***********************************************************/
/* Public Section                                          */
/***********************************************************/

module.exports = ModuleName;

// Constructor for the public object
function ModuleName() {
    // Public field
    this.variable = null;

    // Private non-static field
    this._otherVariable = null;
}

// Add public functions by putting them on the module's prototype
ModuleName.prototype.SomeFunction = function() {
    //Public Function
};