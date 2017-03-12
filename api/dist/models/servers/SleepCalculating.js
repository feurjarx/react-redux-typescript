"use strict";
var es6_shim_1 = require("es6-shim");
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SleepCalculating;
