/*
 * User defined callbacks for handling FlowViz events.
 *
 * Note: in the callbacks, 'this' is bound to our instance of the FlowViz object because FlowViz extends EventEmitter!
 */
var App = new FlowViz.App('config_calculator.json', 'svg#InteractiveViz', {
    Events: {
        "flowviz-ready": function() {
            this.Controls.Create('div#LeftSidebar');
            this.Legend.Create('div#LeftSidebar');
            this.DataEditor.Create('div#LeftSidebar');

            var types = this.Config.getLeafNodesTypes();

            var nodes = [];

            nodes.push(this.GraphManager.AddNode(types[0], 10, 310, false));
            nodes.push(this.GraphManager.AddNode(types[0], 310, 10, false));
            nodes.push(this.GraphManager.AddNode(types[3], 610, 310, false));
            nodes.push(this.GraphManager.AddNode(types[5], 310, 610));

            nodes[0].SetDataItem('Value', 1);
            nodes[1].SetDataItem('Value', 2);

            var edges = [];

            edges.push(this.GraphManager.AddEdge(nodes[0], nodes[2], this.FlowEdge.FORWARD, false));
            edges.push(this.GraphManager.AddEdge(nodes[1], nodes[2], this.FlowEdge.FORWARD, false));
            edges.push(this.GraphManager.AddEdge(nodes[2], nodes[3], this.FlowEdge.FORWARD));

            edges[0].SetDataItem('Order', 1);
            edges[1].SetDataItem('Order', 2);
        },

        "selection-changed": function() {
            var node = this.Selection.Current;
            if (node.type.name === "Output") {
                if (this.ConstraintChecker.IsValidGraph(this.GraphManager.nodes, this.GraphManager.edges)) {
                    this.ShowMessage(calculateResult(this.GraphManager.nodes));
                }
            }
        }
    },

    DataValidation: {
        NumberIsOneOrTwo: function(oldValue, newValue) {
            return newValue === 1 || newValue === 2;
        }
    }
});

function calculateResult(nodes) {
    for (var j = 0; j < nodes.length; j++) {
        nodes[j].input = [];
    }
    var ts = getTopSort(nodes);
    for (var i = 0; i < ts.length; i++) {
        if (ts[i].getOutgoingEdges().length == 0) {
            return ts[i].input[0];
        }
        console.log(ts[i].type.type);
        var value = 0;
        var incoming = ts[i].getIncomingEdges();
        if (incoming.length > 0) {
            var order = incoming[0].GetDataItemValue("Order");
            value = compute(ts[i], order);
        } else {
            value = ts[i].GetDataItemValue('Value');
        }
        ts[i].getOutgoingEdges()[0].end.input.push(value);
    }
    return null;
}

function compute(node, order) {
    if (node.type.name === "Addition") {
        return node.input[0] + node.input[1];
    } else if (node.type.name === "Subtraction") {
        console.log(order);
        if(order === 1) {
            return node.input[1] - node.input[0];
        } else {
            return node.input[0] - node.input[1];
        }
    } else if (node.type.name === "Multiplication") {
        return node.input[0] * node.input[1];
    } else if (node.type.name === "Division") {
        if(order === 1) {
            return node.input[1] / node.input[0];
        } else {
            return node.input[0] / node.input[1];
        }
    }
}

function getTopSort(nodes) {
    var ts = [];
    var currentSet = [];
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].getIncomingEdges().length == 0) {
            currentSet.push(nodes[i]);
        }
    }
    var visitedEdges = [];
    while (currentSet.length > 0) {
        var current = currentSet.pop();
        ts.push(current);
        var outEdges = current.getOutgoingEdges();
        for (i = 0; i < outEdges.length; i++) {
            visitedEdges.push(outEdges[i]);
            var hasEdges = false;
            var inEdges = outEdges[i].end.getIncomingEdges();
            for (var j = 0; j < inEdges.length; j++) {
                if (visitedEdges.indexOf(inEdges[j]) == -1) {
                    hasEdges = true;
                    break;
                }
            }
            if (!hasEdges) {
                currentSet.push(outEdges[i].end)
            }
        }
    }
    return ts;
}
