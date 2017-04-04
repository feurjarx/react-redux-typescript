"use strict";
var md5 = require('md5/md5');
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    random: function (max) {
        return Math.round(Math.random() * max);
    },
    randomByRange: function (min, max) {
        // TODO: make it
    },
    hash: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return md5(args.join(','));
    },
    range: function (min, max) {
        var length = max - min;
        return String(min)
            .repeat(length)
            .split('')
            .map(function (it, i) { return +it + i; });
    }
};
