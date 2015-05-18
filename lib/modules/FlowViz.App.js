var fv = null;
var callbacks = null;

/**
 * Attaches any API callbacks specified in the callbacks object.
 */
function HookFvEvents() {
    for(var cbk in callbacks) {
        if(callbacks.hasOwnProperty(cbk)) {
            if(fv.HasEvent(cbk)) {
                fv.on('flowviz-' + cbk, callbacks[cbk]);
            }
        }
    }
}

module.exports = App;

/**
 * The FlowViz.App module is responsible for handling the user-facing API of FlowViz. Through this module, developers
 * can create and hookup callbacks into the FlowViz API. This is additionally responsible for creating and managing
 * an instance of the FlowViz object.
 *
 * @param config The relative path to the config JSON file
 * @param selector A CSS-style selector for the SVG tag the visualization should be created in
 * @param cbks An object with callbacks to be attached to the FlowViz API
 *
 * @constructor Creates the FlowViz object and attaches callbacks as specified.
 */
function App(config, selector, cbks) {
    callbacks = cbks;
    fv = new FlowViz(config, selector);

    HookFvEvents();
}