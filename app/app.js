var App = new FlowViz.App('config.json', 'svg#InteractiveViz', {

    //Note that the 'this' object is bound to our instance of the FlowViz object because FlowViz extends EventEmitter!
    ready: function() {
        this.Legend.Create('div#LeftSidebar');
    }

});
