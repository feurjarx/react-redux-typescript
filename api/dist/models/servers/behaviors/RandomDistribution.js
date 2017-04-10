"use strict";
var index_1 = require("../../../helpers/index");
var RandomDistribution = (function () {
    function RandomDistribution() {
        this.repeatable = true;
    }
    RandomDistribution.prototype.getSlaveServerNo = function (_, totalSlavesNumber) {
        return index_1.random(totalSlavesNumber - 1);
    };
    return RandomDistribution;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RandomDistribution;
