"use strict";
var index_1 = require("../helpers/index");
var HRow_1 = require("./HRow");
var MapGenerator = (function () {
    function MapGenerator() {
    }
    MapGenerator.prototype.calcRowSizesInfo = function (rowId, fields) {
        var rowSize = 0;
        var sizeByFieldNameMap = {};
        fields.forEach(function (f) {
            var type = f.type, isPrimary = f.isPrimary;
            var fieldSize;
            if (isPrimary) {
                fieldSize = String(rowId).length;
            }
            else {
                var maxFieldSize = f.length;
                if (!maxFieldSize) {
                    if (type === 'Строковый') {
                        maxFieldSize = 255;
                    }
                    if (type === 'Числовой') {
                        maxFieldSize = 11;
                    }
                }
                fieldSize = index_1.random(maxFieldSize);
            }
            sizeByFieldNameMap[f.name] = fieldSize;
            rowSize += fieldSize;
        });
        return {
            rowSize: rowSize,
            sizeByFieldNameMap: sizeByFieldNameMap
        };
    };
    /**
     * @see https://habrastorage.org/getpro/habr/post_images/72f/db4/418/72fdb44187d02c8affdc9740eb691115.png
     * @param fields
     * @returns {Array}
     */
    MapGenerator.getFamilies = function (fields) {
        var result = [];
        var familiesNames = fields
            .filter(function (f) { return f.familyName && !f.isPrimary; })
            .map(function (f) { return f.familyName; })
            .filter(function (f, i, list) { return list.indexOf(f) === i; });
        familiesNames.forEach(function (familyName) {
            var fieldsNames = fields
                .filter(function (f) { return f.familyName === familyName; })
                .map(function (f) { return f.name; });
            result.push(fieldsNames);
        });
        return result;
    };
    MapGenerator.getFieldsFamilyKey = function (fieldsNames) {
        return fieldsNames.join('=').toUpperCase();
    };
    MapGenerator.fillRegions = function (_a, masterServer) {
        var _this = this;
        var tables = _a.tables, totalSize = _a.totalSize;
        var generator = new MapGenerator();
        var hTables = {};
        var maxTableSize = totalSize / tables.length; // avg
        tables.forEach(function (table) {
            var fields = table.fields;
            var tableName = table.name;
            hTables[tableName] = {};
            var families = _this.getFamilies(fields);
            var tableSize = 0;
            var _loop_1 = function (i) {
                var id = i + 1;
                var rowSizesInfo = generator.calcRowSizesInfo(id, fields);
                var sizeByFieldNameMap = rowSizesInfo.sizeByFieldNameMap;
                var rowKey = index_1.hash(tableName, id, Date.now());
                var hRow = new HRow_1.default(rowKey);
                // fill one hRow
                families.forEach(function (fieldsNames) {
                    var familyKey = _this.getFieldsFamilyKey(fieldsNames);
                    var fieldsValues = {};
                    fieldsNames.forEach(function (fieldName) {
                        var fieldSize = sizeByFieldNameMap[fieldName];
                        fieldsValues[fieldName] = (_a = {
                                fieldSize: fieldSize
                            },
                            _a[Date.now()] = { fieldSize: fieldSize },
                            _a);
                        var _a;
                    });
                    hRow.families[familyKey] = fieldsValues;
                });
                hTables[tableName][rowKey] = hRow;
                masterServer.save(hRow);
                tableSize += rowSizesInfo.rowSize;
            };
            for (var i = 0; tableSize < maxTableSize; i++) {
                _loop_1(i);
            }
        });
        return hTables; // logical data struct
    };
    return MapGenerator;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MapGenerator;
