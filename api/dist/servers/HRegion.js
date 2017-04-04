"use strict";
var HRegion = (function () {
    function HRegion(id, serverId, maxSize) {
        this.rows = {};
        this.id = id;
        this.maxSize = maxSize;
        this.serverId = serverId;
        this.freeSpace = maxSize;
    }
    HRegion.prototype.isFitIn = function (requiredSize) {
        return this.freeSpace - requiredSize > 0;
    };
    HRegion.prototype.add = function (hRow) {
        var rows = this.rows;
        rows[hRow.rowKey] = hRow;
        this.freeSpace -= hRow.getSize();
    };
    HRegion.prototype.popHalf = function () {
        var _a = this, rows = _a.rows, updateFreeSize = _a.updateFreeSize;
        var result = [];
        var rowsKeys = Object.keys(rows);
        var midIdx = Math.round(rowsKeys.length / 2);
        rowsKeys.forEach(function (rowKey, i) {
            if (i > midIdx) {
                var hRow = rows[rowKey];
                result.push(hRow);
                delete rows[rowKey];
            }
        });
        updateFreeSize();
        return result;
    };
    HRegion.prototype.updateFreeSize = function () {
        var _a = this, rows = _a.rows, maxSize = _a.maxSize;
        var freeSpace = maxSize;
        rows.for;
    };
    return HRegion;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HRegion;
