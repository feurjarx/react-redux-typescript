"use strict";
var HashDistribution = (function () {
    function HashDistribution() {
    }
    HashDistribution.prototype.getRegionServerNo = function (hRow, totalRegionServersNumbers) {
        return +hRow.rowKey % totalRegionServersNumbers;
    };
    return HashDistribution;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HashDistribution;
