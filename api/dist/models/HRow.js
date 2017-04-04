"use strict";
var HRow = (function () {
    function HRow(rowKey) {
        this.families = {};
        this.rowKey = rowKey;
    }
    HRow.prototype.getSize = function () {
        var result = 0;
        var families = this.families;
        for (var familyKey in families) {
            var family = families[familyKey];
            for (var fieldName in family) {
                result += family[fieldName].fieldSize;
            }
        }
        return result;
    };
    return HRow;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HRow;
