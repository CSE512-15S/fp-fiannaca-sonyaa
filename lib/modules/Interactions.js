var _ = require('lodash');

var FlowNode = require('../modules/FlowNode');
var FlowEdge = require('../modules/FlowEdge');

var fv = null;
var clickTimeout = null;

module.exports = Interactions;

function Interactions(flowviz) {
    fv = flowviz;

    this._interactions = [];

    // Defaults
    this.SetInteraction("TouchNode", "click", SelectOrRemoveNode);
    this.SetInteraction("StartConnection", "dblclick", StartConn);
    this.SetInteraction("MoveNode", "drag", MoveNode);
    this.SetInteraction("TouchEdge", "click", RemoveEdge);
    this.SetInteraction("ChangeEdge", "dblclick", ChangeEdgeDirection);

    // User overrides
    var that = this;
    _.forEach(fv.Config.Interactions, function(interaction, name) {
       // TODO: do something to set user defined interactions
    });
}

Interactions.prototype.SetInteraction = function(name, domEvt, func) {
    var index = _.findIndex(this._interactions, function(i) {
        return i.name === name;
    });

    if(index < 0) {
        this._interactions.push({
            name: name,
            event: domEvt,
            func: func
        });
    } else {
        this._interactions[index].event = domEvt;
        this._interactions[index].func = func;
    }
};

Interactions.prototype.GetDomEvent = function(name) {
    var index = _.findIndex(this._interactions, function(i) {
        return i.name === name;
    });

    if(index >= 0) {
        return this._interactions[index].event;
    }

    throw new Error(name + " is not a registered interaction!");
};

Interactions.prototype.GetFunc = function(name) {
    var index = _.findIndex(this._interactions, function(i) {
        return i.name === name;
    });

    if(index >= 0) {
        return this._interactions[index].func;
    }

    throw new Error(name + " is not a registered interaction!");
};

function SelectOrRemoveNode(d, i) {
    // When there is a selected node, stop the click propagation
    if(fv.Selection.Current !== null) {
        d3.event.stopPropagation();
    }

    // Dragging shouldn't change a selection
    if (d3.event.defaultPrevented) return;

    // If ctrl is down, remove the node, otherwise, select it
    if (d3.event.ctrlKey) {
        fv.Renderer.Reinitialize();
        fv.GraphManager.RemoveNode(d);
    } else {

        d3.event.stopPropagation();
        if(clickTimeout === null) {
            clickTimeout = setTimeout(function (data, that) {
                fv.Selection.UpdateSelection(data, d3.select(that));
                clickTimeout = null;
            }, 200, d, this);
        }
    }
}

function ChangeEdgeDirection(d, i) {
    d3.event.sourceEvent.stopPropagation();
    d.direction = (d.direction + 1) % FlowEdge.TOTAL_DIRS;
    fv.Renderer.RedrawEdges();
}

function MoveNode(d, i) {
    fv.GraphManager.MoveNode(d, d.x = d3.event.x, d.y = d3.event.y);
}

function RemoveEdge(d, i) {
    if (d3.event.ctrlKey) {
        fv.Renderer.Reinitialize();
        fv.GraphManager.RemoveEdge(d);
    }
}

function StartConn(d, i) {
    if(clickTimeout !== null) {
        clearTimeout(clickTimeout);
        clickTimeout = null;
    }

    fv.Selection.Clear(true);
    fv.GraphManager.StartConnection(d, d3.event.x, d3.event.y);
}