//Private
var offset = 30;
var arrHeight = 25;
var arrWidth = 10;


//Public
module.exports = FlowEdge;

// Possible edge directions
module.exports.FORWARD = 0;
module.exports.BACKWARD = 1;
module.exports.BOTH = 2;
module.exports.NONE = 3;

function FlowEdge(start, end, direction) {
    this.start = start;
    this.end = end;
    this.direction = direction;

    if(direction < module.exports.FORWARD || direction > module.exports.NONE) {
        throw new Error("Direction must be one of FlowEdge.{FORWARD, BACKWARD, BOTH, or NONE}");
    }

    var denom =  Math.sqrt(Math.pow(this.end.x - this.start.x,2) + Math.pow(this.end.y - this.start.y,2));

    this.dx = ((this.end.x - this.start.x) / denom);
    this.dy = ((this.end.y - this.start.y) / denom);

    this.startPt = {
        x: this.start.x + offset * this.dx,
        y: this.start.y + offset * this.dy
    };
    this.endPt = {
        x: this.end.x - offset * this.dx,
        y: this.end.y - offset * this.dy
    };
}

FlowEdge.prototype.getPath = function() {
    return [this.startPt, this.endPt];
};

FlowEdge.prototype.getTipPath = function() {
    var bottomX, bottomY;

    if(this.direction === module.exports.FORWARD) {
        bottomX = this.endPt.x - arrHeight * this.dx;
        bottomY = this.endPt.y - arrHeight * this.dy;

        return [{
            x: bottomX + this.dx * arrWidth,
            y: bottomY - this.dy * arrWidth
        },{
            x: this.endPt.x,
            y: this.endPt.y
        },{
            x: bottomX - this.dx * arrWidth,
            y: bottomY + this.dy * arrWidth
        }];
    } else if(this.direction === module.exports.BACKWARD) {
        bottomX = this.startPt.x + arrHeight * this.dx;
        bottomY = this.startPt.y + arrHeight * this.dy;

        return [{
            x: bottomX + this.dx * arrWidth,
            y: bottomY - this.dy * arrWidth
        },{
            x: this.startPt.x,
            y: this.startPt.y
        },{
            x: bottomX - this.dx * arrWidth,
            y: bottomY + this.dy * arrWidth
        }];
    } else {
        return [{
            x: this.startPt.x,
            y: this.startPt.y
        },{
            x: this.startPt.x,
            y: this.startPt.y
        }];
    }
};

