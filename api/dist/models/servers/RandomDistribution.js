"use strict";
var index_1 = require("./../../helpers/index");
var RandomDistribution = (function () {
    function RandomDistribution() {
    }
    RandomDistribution.prototype.getRegionServerNo = function (_, totalRegionServersNumbers) {
        return index_1.random(totalRegionServersNumbers - 1);
    };
    return RandomDistribution;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RandomDistribution;
