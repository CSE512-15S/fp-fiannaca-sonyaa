//Note that in the callbacks the 'this' object is bound to our instance of the FlowViz object because
// FlowViz extends EventEmitter!
var App = new FlowViz.App('config.json', 'svg#InteractiveViz', {

    ready: function() {
        this.Legend.Create('div#LeftSidebar');
    }

});
