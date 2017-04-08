"use strict";
var HashDistribution = (function () {
    function HashDistribution() {
    }
    HashDistribution.prototype.getSlaveServerNo = function (hRow, totalSlavesNumber) {
        return +('0x' + hRow.rowKey) % totalSlavesNumber;
    };
    return HashDistribution;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HashDistribution;
