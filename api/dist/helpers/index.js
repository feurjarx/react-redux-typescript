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
    return (min + ',')
        .repeat(length)
        .slice(0, -1)
        .split(',')
        .map(function (it, i) { return +it + i; });
}
exports.range = range;
function generateWord(length, abc) {
    if (abc === void 0) { abc = "ABCDEFGH"; }
    var word = '';
    for (var i = 0; i < length; i++) {
        word += abc.charAt(Math.floor(Math.random() * abc.length));
    }
    return word;
}
exports.generateWord = generateWord;
