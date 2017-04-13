"use strict";
var index_1 = require("../helpers/index");
var HRow_1 = require("./HRow");
var index_2 = require("../constants/index");
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
                    if (type === index_2.FIELD_TYPE_STRING) {
                        maxFieldSize = 255;
                    }
                    if (type === index_2.FIELD_TYPE_NUMBER) {
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
    MapGenerator.getFieldTypeByNameMap = function (fields) {
        var map = {};
        fields.forEach(function (f) { return map[f.name] = f.type; });
        return map;
    };
    MapGenerator.fillRegions = function (_a, masterServer) {
        var _this = this;
        var tables = _a.tables;
        var generator = new MapGenerator();
        tables.forEach(function (table) {
            var fields = table.fields, sharding = table.sharding;
            if (!fields.find(function (f) { return f.name === 'created_at'; })) {
                fields.push({
                    name: 'created_at',
                    type: index_2.FIELD_TYPE_NUMBER
                });
            }
            var tableSize = index_2.HDD_ASPECT_RATIO * table.tableSize;
            var tableName = table.name;
            var families = _this.getFamilies(fields);
            var fieldTypeByNameMap = _this.getFieldTypeByNameMap(fields);
            var tableSizeCounter = 0;
            var _loop_1 = function (i) {
                var id = i + 1;
                var rowSizesInfo = generator.calcRowSizesInfo(id, fields);
                var sizeByFieldNameMap = rowSizesInfo.sizeByFieldNameMap;
                var rowKey = index_1.hash(tableName, id, Date.now());
                var hRow = new HRow_1.default(rowKey, tableName);
                // fill one hRow
                families.forEach(function (fieldsNames) {
                    var familyKey = HRow_1.default.calcFamilyKey(fieldsNames);
                    var fieldsValues = {};
                    fieldsNames.forEach(function (fieldName) {
                        var fieldValue = null;
                        switch (fieldTypeByNameMap[fieldName]) {
                            case index_2.FIELD_TYPE_NUMBER:
                                fieldValue = index_1.random(10);
                                break;
                            case index_2.FIELD_TYPE_STRING:
                                fieldValue = index_1.generateWord(3);
                                break;
                        }
                        var fieldSize = sizeByFieldNameMap[fieldName];
                        fieldsValues[fieldName] = {
                            fieldSize: fieldSize,
                            versions: (_a = {},
                                _a[Date.now()] = fieldValue,
                                _a)
                        };
                        var _a;
                    });
                    hRow.families[familyKey] = fieldsValues;
                });
                var shardingType = sharding ? sharding.type : '';
                masterServer.setShardingType(shardingType);
                masterServer.save(hRow, sharding);
                tableSizeCounter += rowSizesInfo.rowSize;
            };
            for (var i = 0; tableSizeCounter < tableSize; i++) {
                _loop_1(i);
            }
        });
    };
    return MapGenerator;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MapGenerator;
