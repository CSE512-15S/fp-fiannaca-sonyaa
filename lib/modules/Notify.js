var fv = null;

module.exports = Notify;

module.exports.SHORT = 2000;
module.exports.NORMAL = 3000;
module.exports.LONG = 4000;

/**
 * The Notify module manages displaying messages from the FlowViz library to the end user. This can include standard
 * status messages, warning messages, or error messages
 *
 * @param {FlowViz} flowviz A reference to the current instance of the FlowViz library
 */
function Notify(flowviz) {
    fv = flowviz;

    if(fv.Config.ShowDefaultMsgs) {
        var div = $('<div id="notify-message" class="notify-hide"><span /></div>');
        $('body').append(div);

        fv.on('notify-std', stdMsg);
        fv.on('notify-warn', warnMsg);
        fv.on('notify-error', errorMsg);

        fv.on('notify-clear', clearMsg);
    }
}

/**
 * Shows a standard status message in the corner of the interface.
 *
 * @param {string}  msg         The message to display
 * @param {number}  duration    The time (ms) to display the message
 */
function stdMsg(msg, duration) {
    if(duration === undefined) {
        duration = module.exports.NORMAL;
    }

    $('#notify-message').text(msg);
    $('#notify-message').removeClass('notify-hide');

    setTimeout(function() {
        $('#notify-message').addClass('load');

        if(duration >= 0) {
            setTimeout(function () {
                $('#notify-message').removeClass('load');
                setTimeout(function () {
                    $('#notify-message').addClass('notify-hide');
                }, 500);
            }, duration);
        }
    }, 100);
}


/**
 * Shows a warning message in the corner of the interface.
 *
 * @param {string}  msg         The message to display
 * @param {number}  duration    The time (ms) to display the message
 */
function warnMsg(msg, duration) {
    if(duration === undefined) {
        duration = module.exports.NORMAL;
    }

    $('#notify-message').text(msg);
    $('#notify-message').removeClass('notify-hide');

    setTimeout(function() {
        $('#notify-message').addClass('warn');
        $('#notify-message').addClass('load');

        if(duration >= 0) {
            setTimeout(function () {
                $('#notify-message').removeClass('load');
                setTimeout(function () {
                    $('#notify-message').addClass('notify-hide');
                    $('#notify-message').removeClass('warn');
                }, 500);
            }, duration);
        }
    }, 100);
}


/**
 * Shows an error message in the corner of the interface.
 *
 * @param {string}  msg         The message to display
 * @param {number}  duration    The time (ms) to display the message
 */
function errorMsg(msg, duration) {
    if(duration === undefined) {
        duration = module.exports.NORMAL;
    }

    $('#notify-message').text(msg);
    $('#notify-message').removeClass('notify-hide');

    setTimeout(function() {
        $('#notify-message').addClass('error');
        $('#notify-message').addClass('load');

        if(duration >= 0) {
            setTimeout(function () {
                $('#notify-message').removeClass('load');
                setTimeout(function () {
                    $('#notify-message').addClass('notify-hide');
                    $('#notify-message').removeClass('error');
            }, 500);
            }, duration);
        }
    }, 100);
}

/**
 * Clears any messages from the interface.
 */
function clearMsg() {
    $('#notify-message').removeClass('load');

    setTimeout(function () {
        $('#notify-message').addClass('notify-hide');
        $('#notify-message').removeClass('error');
        $('#notify-message').removeClass('warn');
    }, 500);
}
