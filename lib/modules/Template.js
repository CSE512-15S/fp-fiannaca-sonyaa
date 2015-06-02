var fv = null;

// Always put the export and constructor at the top of the page
module.exports = ModuleName;

// Constructor for the public object
function ModuleName() {
    // Public field
    this.variable = null;

    // Private non-static field
    this._otherVariable = null;
}

/***********************************************************/
/* Private Section                                         */
/***********************************************************/

// Define private static functions like this
function OtherFunction() {
    // Private Static Function
}

// Define private static variables like this
var anotherVar = null;

// Add private non-static functions like this
ModuleName.prototype._PrivateFunction = function() {
    // "Private" non-static function
};

/***********************************************************/
/* Public Section                                          */
/***********************************************************/

// Add public functions by putting them on the module's prototype
ModuleName.prototype.SomeFunction = function() {
    // Public Function
};