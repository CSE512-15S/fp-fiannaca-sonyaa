var _ = require('lodash');

var fv = null;

/**
 * Attaches any API callbacks specified in the callbacks object.
 */
function HookFvEvents(callbacks) {
    _.forEach(callbacks, function(func, key) {
        if(fv.HasEvent(key)) {
            fv.on('flowviz-' + key, func);
        }
    });
}

module.exports = App;

/**
 * The FlowViz.App module is responsible for handling the user-facing API of FlowViz. Through this module, developers
 * can create and hookup callbacks into the FlowViz API. This is additionally responsible for creating and managing
 * an instance of the FlowViz object.
 *
 * @param {String}  config      The relative path to the config JSON file
 * @param {String}  selector    A CSS-style selector for the SVG tag the visualization should be created in
 * @param {object}  cbks        An object with callbacks to be attached to the FlowViz API
 *
 * @constructor Creates the FlowViz object and attaches callbacks as specified.
 */
function App(config, selector, cbks) {
    this.Callbacks = cbks;

    if(!this.Callbacks.hasOwnProperty("Validators")) {
        this.Callbacks.Validators = {};
    }

    fv = new FlowViz(this, config, selector);

    HookFvEvents(this.Callbacks);
}