"use strict";
var VerticalSharding = (function () {
    function VerticalSharding() {
    }
    VerticalSharding.prototype.getSlaveServerNo = function (hRow, totalSlavesNumber) {
        return +('0x' + hRow.rowKey) % totalSlavesNumber;
    };
    return VerticalSharding;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VerticalSharding;
