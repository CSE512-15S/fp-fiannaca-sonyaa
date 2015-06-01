var Inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

Inherits(Notify, EventEmitter);

var fv = null;

module.exports = Notify;

module.exports.SHORT = 2000;
module.exports.NORMAL = 3000;
module.exports.LONG = 4000;

/**
 *
 * @param flowviz
 * @constructor
 */
function Notify(flowviz) {
    fv = flowviz;

    if(fv.Config.ShowDefaultMsgs) {
        var div = $('<div id="notify-message" class="hide"><span /></div>');
        $('body').append(div);

        fv.on('notify-std', stdMsg);
        fv.on('notify-warn', warnMsg);
        fv.on('notify-error', errorMsg);
    }
}

function stdMsg(msg, duration) {
    if(duration === undefined) {
        duration = module.exports.NORMAL;
    }

    $('#notify-message').text(msg);
    $('#notify-message').removeClass('hide');

    setTimeout(function() {
        $('#notify-message').addClass('hide');
    }, duration);
}

function warnMsg(msg, duration) {
    if(duration === undefined) {
        duration = module.exports.NORMAL;
    }

    $('#notify-message').text(msg);
    $('#notify-message').removeClass('hide');
    $('#notify-message').addClass('warn');

    setTimeout(function() {
        $('#notify-message').addClass('hide');
        $('#notify-message').removeClass('warn');
    }, duration);
}

function errorMsg(msg, duration) {
    if(duration === undefined) {
        duration = module.exports.NORMAL;
    }

    $('#notify-message').text(msg);
    $('#notify-message').removeClass('hide');
    $('#notify-message').addClass('error');

    setTimeout(function() {
        $('#notify-message').addClass('hide');
        $('#notify-message').removeClass('error');
    }, duration);
}
