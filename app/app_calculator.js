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
        },

        "selection-changed": function() {
            var node = this.Selection.Current;
            if (node.type.name === "Output") {
                if (this.ConstraintChecker.IsValidGraph(this.GraphManager.nodes, this.GraphManager.edges)) {
                    this.ShowMessage(calculateResult(this.GraphManager.nodes));
                }
            }
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
        if (ts[i].getIncomingEdges().length > 0) {
            value = compute(ts[i]);
        } else {
            value = ts[i].GetDataItemValue('Value');
        }
        ts[i].getOutgoingEdges()[0].end.input.push(value);
    }
    return null;
}

function compute(node) {
    if (node.type.name === "Addition") {
        return node.input[0] + node.input[1];
    } else if (node.type.name === "Subtraction") {
        return node.input[0] - node.input[1];
    } else if (node.type.name === "Multiplication") {
        return node.input[0] * node.input[1];
    } else if (node.type.name === "Division") {
        return node.input[0] / node.input[1];
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
