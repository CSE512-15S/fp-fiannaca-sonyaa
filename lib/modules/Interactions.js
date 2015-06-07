var _ = require('lodash');

var FlowNode = require('../modules/FlowNode');
var FlowEdge = require('../modules/FlowEdge');

var fv = null;
var clickTimeout = null;

module.exports = Interactions;
module.exports.Types = [
    'Node',
    'Drag',
    'EdgeRegion',
    'NewEdge',
    'CreateEdge'
];

function Interactions(flowviz) {
    fv = flowviz;

    this._interactions = [];
    this._supers = [];

    // Defaults
    this.SetDefault("Node", "click", SelectOrRemoveNode);
    this.SetDefault("Node", "dblclick", StartConn);
    this.SetDefault("Drag", "drag", MoveNode);
    this.SetDefault("EdgeRegion", "click", SelectOrRemoveEdge);
    //this.SetDefault("EdgeRegion", "dblclick", ChangeEdgeDirection);
    this.SetDefault("NewEdge", "mousemove", UpdateNewEdge);
    this.SetDefault("NewEdge", "click", CancelEdge);
    this.SetDefault("CreateEdge", "click", FinishEdge);

    // User overrides
    var that = this;
    console.log(fv.Config.Interactions);
    _.forEach(fv.Config.Interactions, function(interaction, name) {
       // TODO: do something to set user defined interactions
        console.log("adding interaction");
        that.SetOverride(name, interaction.event, fv.App.Callbacks.Interactions[interaction.function]);
    });
}

Interactions.prototype.SetupInteractions = function(selection, interactions) {
    _.forEach(fv.Interactions._interactions, function (int) {
        if (_.includes(interactions, int.name)) {
            selection.on(int.event, int.func);
        }
    });
};

Interactions.prototype.Clear = function(selection, interactions) {
    _.forEach(fv.Interactions._interactions, function (int) {
        if (_.includes(interactions, int.name)) {
            selection.on(int.event, null);
        }
    });
};

Interactions.prototype.SetDefault = function(name, domEvt, func) {
    var index = _.findIndex(this._interactions, function(i) {
        return i.name === name && i.event === domEvt;
    });

    if(index < 0) {
        this._interactions.push({
            name: name,
            event: domEvt,
            func: func
        });

        this._supers.push({
            name: name,
            event: domEvt,
            func: func
        });

        return;
    }

    throw new Error("You can't set more than one default interaction!");
};

Interactions.prototype.RunSuper = function(name, event, thisArg) {
    var index = _.findIndex(this._supers, function(i) {
        return i.name === name && i.event === event;
    });

    this._supers[index].func.apply(thisArg, _.slice(arguments, 3));
};

Interactions.prototype.SetOverride = function(name, domEvt, func, thisArg) {
    if(thisArg === undefined) {
        thisArg = {};
    }

    var index = _.findIndex(this._interactions, function(i) {
        return i.name === name && i.event === domEvt;
    });

    if(index < 0) {

        throw new Error("You can't override an interaction that doesn't exist!");

    } else {
        var sup = this._interactions[index].func;
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
    //d3.event.sourceEvent.stopPropagation();
    d.direction = (d.direction + 1) % FlowEdge.TOTAL_DIRS;
    fv.Renderer.RedrawEdges();
}

function MoveNode(d, i) {
    fv.GraphManager.MoveNode(d, d.x = d3.event.x, d.y = d3.event.y);
}

function SelectOrRemoveEdge(d, i) {
    d3.event.stopPropagation();

    if (d3.event.ctrlKey) {
        fv.Renderer.Reinitialize();
        fv.GraphManager.RemoveEdge(d);
    } else {
        fv.Selection.SelectEdge(d);
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

function UpdateNewEdge(evt) {
    d3.select('g.flow-node-temp')
        .attr('transform', function(d) {
            d.x = evt.offsetX;
            d.y = evt.offsetY;
            return 'translate(' + d.x + ',' + d.y + ')';
        });

    d3.select('g.flow-edge-temp')
        .each(function(d) {
            d.Update();
        })
        .select('path')
        .attr('d', function(d) {
            return fv.Renderer.DrawLine(d.getPath());
        });
}

function FinishEdge(d, i) {
    fv.GraphManager.EndConnection(d);
    fv.Renderer.RemoveTempListeners();
}

function CancelEdge() {
    fv.GraphManager.EndConnection(null);
    fv.Renderer.RemoveTempListeners();
}