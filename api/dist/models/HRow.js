"use strict";
var HRow = (function () {
    function HRow(rowKey, tableName) {
        this.families = {};
        this.rowKey = rowKey;
        this.tableName = tableName;
    }
    HRow.prototype.getFirstVersionValueFromCell = function (rowCell) {
        var versions = rowCell.versions;
        var tsList = Object.keys(versions);
        return versions[tsList[0]];
    };
    HRow.prototype.getValueByFieldName = function (name) {
        var result = null;
        for (var it in this.families) {
            var rowCell = this.families[it][name];
            if (rowCell) {
                result = this.getFirstVersionValueFromCell(rowCell);
                break;
            }
        }
        return result;
    };
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
