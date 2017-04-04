"use strict";
var HashDistribution = (function () {
    function HashDistribution() {
    }
    HashDistribution.prototype.getRegionServerNo = function (hRow, totalRegionServersNumbers) {
        return +('0x' + hRow.rowKey) % totalRegionServersNumbers;
    };
    return HashDistribution;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HashDistribution;
