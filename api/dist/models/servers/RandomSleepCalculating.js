"use strict";
var es6_shim_1 = require("es6-shim");
var RandomSleepCalculating = (function () {
    function RandomSleepCalculating(max) {
        if (max === void 0) { max = 1000; }
        this.max = max;
    }
    RandomSleepCalculating.prototype.calculate = function (max) {
        if (max === void 0) { max = this.max; }
        var sleep = Math.round(Math.random() * max);
        return new es6_shim_1.Promise(function (resolve) { return setTimeout(function () { return resolve({ duration: sleep }); }, sleep); });
    };
    return RandomSleepCalculating;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RandomSleepCalculating;
