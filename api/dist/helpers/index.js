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
