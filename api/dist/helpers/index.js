"use strict";
var md5 = require('md5/md5');
function composition() {
    var fns = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        fns[_i] = arguments[_i];
    }
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return fns.forEach(function (f) { return f.apply(null, args); });
    };
}
exports.composition = composition;
function random(max) {
    return Math.round(Math.random() * max);
}
exports.random = random;
function hash() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return md5(args.join(','));
}
exports.hash = hash;
function range(min, max) {
    var length = max - min;
    return String(min)
        .repeat(length)
        .split('')
        .map(function (it, i) { return +it + i; });
}
exports.range = range;
exports.SocketLogger = (function () {
    var consoleLog = console.log;
    var counter = 0;
    var batch = [];
    function batchClear() {
        while (batch.length) {
            batch.pop();
        }
    }
    function enable(client, eventName, batchSize, delimiter) {
        if (batchSize === void 0) { batchSize = 10; }
        if (delimiter === void 0) { delimiter = '<br>'; }
        console.log = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            consoleLog.apply(console, args);
            if (args[0] !== false) {
                var log = args.join(',');
                batch.push(log);
                counter++;
                if (counter % batchSize === 0) {
                    client.emit(eventName, batch.join(delimiter));
                    batchClear();
                }
            }
        };
    }
    function disable() {
        console.log = consoleLog;
        counter = 0;
        batchClear();
    }
    return {
        disable: disable,
        enable: enable
    };
}());
