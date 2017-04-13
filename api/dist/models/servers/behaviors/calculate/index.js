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
        return new es6_shim_1.Promise(function (resolve) { return setTimeout(function () { return (resolve({ duration: sleep })); }, sleep); });
    };
    return RandomSleepCalculating;
}());
exports.RandomSleepCalculating = RandomSleepCalculating;
var SleepCalculating = (function () {
    function SleepCalculating(sleep) {
        this.sleep = 200;
        this.sleep = sleep;
    }
    SleepCalculating.prototype.calculate = function () {
        var _this = this;
        return new es6_shim_1.Promise(function (resolve) { return setTimeout(function () { return resolve(); }, _this.sleep); });
    };
    return SleepCalculating;
}());
exports.SleepCalculating = SleepCalculating;
