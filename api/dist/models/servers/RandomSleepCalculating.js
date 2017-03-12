"use strict";
var es6_shim_1 = require("es6-shim");
var RandomSleepCalculating = (function () {
    function RandomSleepCalculating(dispersion) {
        if (dispersion === void 0) { dispersion = 1000; }
        this.dispersion = dispersion;
    }
    RandomSleepCalculating.prototype.calculate = function () {
        var sleep = Math.round(Math.random() * this.dispersion);
        return new es6_shim_1.Promise(function (resolve) { return setTimeout(function () { return resolve(); }, sleep); });
    };
    return RandomSleepCalculating;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RandomSleepCalculating;
