var _ = require('lodash');

var fv = null;

/**
 * Attaches any API callbacks specified in the callbacks object.
 */
function HookFvEvents(callbacks) {
    _.forEach(callbacks.Events, function(func, key) {
        if(fv.HasEvent(key)) {
            fv.on(key, func);
        }
    });
}

module.exports = App;

/**
 * The FlowViz.App module is responsible for handling the user-facing API of FlowViz. Through this module, developers
 * can create and hookup event listeners, callbacks, and validators into the FlowViz API. This is additionally
 * responsible for creating and managing an instance of the FlowViz object.
 *
 * @param {String}  config      The relative path to the config JSON file
 * @param {String}  selector    A CSS-style selector for the SVG tag the visualization should be created in
 * @param {object}  setup       A setup object that has three fields: events (for FlowViz event listeners), callbacks
 *                              (for overriding default FlowViz logic), and validators (for validating data items or
 *                              custom constraint checking).
 *
 * @constructor Creates the FlowViz object and attaches callbacks as specified.
 */
function App(config, selector, setup) {
    this.Callbacks = setup;

    if(!this.Callbacks.hasOwnProperty("Events")) {
        this.Callbacks.Events = {};
    }

    if(!this.Callbacks.hasOwnProperty("Validators")) {
        this.Callbacks.Validators = {};
    }

    fv = new FlowViz(this, config, selector);

    HookFvEvents(this.Callbacks);
}

/**
 * Validates a value given the key for a custom validator, the old data item value, and the new data item value.
 *
 * @param {string}  valName     Custom validator key
 * @param {object}  oldVal      The old value for this data item
 * @param {object}  newVal      The new value for this data item
 *
 * @return {boolean}    True if the new value is valid. Throws an error if the given validator does not exist.
 */
App.prototype.Validate = function(valName, oldVal, newVal) {
    if(this.Callbacks.Validators.hasOwnProperty(valName)) {
        return this.Callbacks.Validators[valName](oldVal, newVal);
    }

    throw new Error("No validator exists with the name " + valName + "!");
};