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
    if (abc === void 0) { abc = "abc"; }
    var word = '';
    for (var i = 0; i < length; i++) {
        word += abc.charAt(Math.floor(Math.random() * abc.length));
    }
    return word;
}
exports.generateWord = generateWord;
function str2numbers(v) {
    return +v
        .split('')
        .map(function (ch) { return ch.charCodeAt(0); })
        .join('');
}
exports.str2numbers = str2numbers;
function unique(arr) {
    return arr.filter(function (it, i) { return arr.indexOf(it) === i; });
}
exports.unique = unique;
function qtrim(v) {
    if (['\'', '"', '`'].indexOf(v[0]) >= 0) {
        v = v.slice(1);
    }
    if (['\'', '"', '`'].indexOf(v.slice(-1)) >= 0) {
        v = v.slice(0, -1);
    }
    return v;
}
exports.qtrim = qtrim;
