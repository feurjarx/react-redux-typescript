"use strict";
var HorizontalSharding = (function () {
    function HorizontalSharding() {
    }
    HorizontalSharding.prototype.getSlaveServerNo = function (hRow, totalSlavesNumber) {
        return +('0x' + hRow.rowKey) % totalSlavesNumber;
    };
    return HorizontalSharding;
}());
exports.HorizontalSharding = HorizontalSharding;
var VerticalSharding = (function () {
    function VerticalSharding() {
    }
    VerticalSharding.prototype.getSlaveServerNo = function (hRow, totalSlavesNumber) {
        return +('0x' + hRow.rowKey) % totalSlavesNumber;
    };
    return VerticalSharding;
}());
exports.VerticalSharding = VerticalSharding;
var RandomSharding = (function () {
    function RandomSharding() {
        this.repeatable = true;
    }
    RandomSharding.prototype.getSlaveServerNo = function (_, totalSlavesNumber) {
        return random(totalSlavesNumber - 1);
    };
    return RandomSharding;
}());
exports.RandomSharding = RandomSharding;
