/*
 * User defined callbacks for handling FlowViz events.
 *
 * Note: in the callbacks, 'this' is bound to our instance of the FlowViz object because FlowViz extends EventEmitter!
 */
var App = new FlowViz.App('config.json', 'svg#InteractiveViz', {

    ready: function() {
        this.Legend.Create('div#LeftSidebar');
    }

});
