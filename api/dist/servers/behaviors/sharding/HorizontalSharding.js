"use strict";
var HorizontalSharding = (function () {
    function HorizontalSharding() {
    }
    HorizontalSharding.prototype.getSlaveServerNo = function (hRow, totalSlavesNumber) {
        return +('0x' + hRow.rowKey) % totalSlavesNumber;
    };
    return HorizontalSharding;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HorizontalSharding;
