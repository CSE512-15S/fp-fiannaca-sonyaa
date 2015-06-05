/*
 * User defined callbacks for handling FlowViz events.
 *
 * Note: in the callbacks, 'this' is bound to our instance of the FlowViz object because FlowViz extends EventEmitter!
 */
var App = new FlowViz.App('config.json', 'svg#InteractiveViz', {
    Events: {
        "flowviz-ready": function() {
            this.Controls.Create('div#LeftSidebar');
            this.Legend.Create('div#LeftSidebar');
            this.DataEditor.Create('div#LeftSidebar');

            var types = this.Config.getLeafNodesTypes();

            var nodes = [];

            nodes.push(this.GraphManager.AddNode(types[0], 10, 310, false));
            nodes.push(this.GraphManager.AddNode(types[1], 310, 10, false));
            nodes.push(this.GraphManager.AddNode(types[2], 610, 310, false));
            nodes.push(this.GraphManager.AddNode(types[3], 310, 610));

            nodes[0].SetDataItem('SomeNumber', 19);

            this.GraphManager.AddEdge(nodes[0], nodes[2], this.FlowEdge.FORWARD, false);
            this.GraphManager.AddEdge(nodes[1], nodes[3], this.FlowEdge.FORWARD, false);
            this.GraphManager.AddEdge(nodes[2], nodes[3], this.FlowEdge.BACKWARD, false);
            this.GraphManager.AddEdge(nodes[3], nodes[2], this.FlowEdge.BACKWARD);
        },

        "node-added": function() {
            this.ShowMessage("Node added!");
        }
    },

    Validators: {
        NumberInRange: function(oldValue, newValue) {
            return (newValue > 0 && newValue < 20);
        }
    }
});
