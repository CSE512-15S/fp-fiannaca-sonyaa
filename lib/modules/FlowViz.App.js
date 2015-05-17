var fv = null;
var callbacks = null;

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

function App(config, selector, cbks) {
    callbacks = cbks;
    fv = new FlowViz(config, selector);

    HookFvEvents();
}