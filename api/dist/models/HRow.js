"use strict";
var HRow = (function () {
    function HRow(rowKey, tableName) {
        this.families = {};
        this.rowKey = rowKey;
        this.tableName = tableName;
    }
    HRow.getGuideArrowKey = function (_a) {
        var table = _a.table, field = _a.field, value = _a.value;
        return [table, field, value].join('*');
    };
    HRow.prototype.getFirstVersionValueFromCell = function (rowCell) {
        var versions = rowCell.versions;
        var tsList = Object.keys(versions);
        return versions[tsList[0]];
    };
    HRow.prototype.getFields = function () {
        var result = [];
        for (var familyName in this.families) {
            for (var fieldName in this.families[familyName]) {
                result.push({
                    table: this.tableName,
                    field: fieldName,
                    value: this.getValueByFieldName(fieldName)
                });
            }
        }
        return result;
    };
    HRow.prototype.getFieldsValuesMap = function () {
        var map = {};
        for (var familyName in this.families) {
            for (var fieldName in this.families[familyName]) {
                map[fieldName] = this.getValueByFieldName(fieldName);
            }
        }
        return map;
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
