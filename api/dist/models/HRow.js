"use strict";
var index_1 = require("../constants/index");
var index_2 = require("../constants/index");
var index_3 = require("../helpers/index");
var HRow = (function () {
    function HRow(rowKey, tableName) {
        this.families = {};
        this.id = Date.now();
        this.rowKey = rowKey;
        this.tableName = tableName;
    }
    HRow.calcArrowKey = function (_a) {
        var table = _a.table, field = _a.field, value = _a.value;
        return [table, field, value].join('*');
    };
    HRow.calcFamilyKey = function (fieldsNames) {
        return fieldsNames.sort().join('=').toUpperCase();
    };
    HRow.getFieldTypeByNameMap = function (fields) {
        var map = {};
        fields.forEach(function (f) { return map[f.name] = f.type; });
        return map;
    };
    /**
     * @see https://habrastorage.org/getpro/habr/post_images/72f/db4/418/72fdb44187d02c8affdc9740eb691115.png
     * @param fields
     * @returns {Array}
     */
    HRow.getFamiliesFromFields = function (fields) {
        return fields
            .map(function (f) { return f.familyName; })
            .filter(function (f, i, list) { return list.indexOf(f) === i; })
            .map(function (familyName) { return (fields
            .filter(function (f) { return f.familyName === familyName; })
            .map(function (f) { return f.name; })); });
    };
    HRow.getSizeByFieldNameMap = function (id, fields) {
        var map = {};
        fields.forEach(function (field) {
            var type = field.type, isPrimary = field.isPrimary;
            var fieldSize;
            if (isPrimary) {
                fieldSize = String(id).length;
            }
            else {
                var maxFieldSize = field.length;
                if (!maxFieldSize) {
                    if (type === index_2.FIELD_TYPE_STRING) {
                        maxFieldSize = 255;
                    }
                    if (type === index_2.FIELD_TYPE_NUMBER) {
                        maxFieldSize = 11;
                    }
                }
                fieldSize = index_3.random(maxFieldSize);
            }
            map[field.name] = fieldSize;
        });
        return map;
    };
    HRow.prototype.define = function (fields) {
        var _this = this;
        var fieldTypeByNameMap = HRow.getFieldTypeByNameMap(fields);
        var sizeByFieldNameMap = HRow.getSizeByFieldNameMap(this.id, fields);
        this.indexedFields = fields
            .filter(function (f) { return f.indexed || f.isPrimary; })
            .map(function (f) { return f.name; });
        HRow
            .getFamiliesFromFields(fields)
            .forEach(function (fieldsNames) {
            var fieldsValues = {};
            fieldsNames.forEach(function (fieldName) {
                var fieldValue = null;
                switch (fieldTypeByNameMap[fieldName]) {
                    case index_2.FIELD_TYPE_NUMBER:
                        fieldValue = index_3.random(10);
                        break;
                    case index_2.FIELD_TYPE_STRING:
                        fieldValue = index_3.generateWord(3);
                        break;
                }
                fieldsValues[fieldName] = {
                    fieldSize: sizeByFieldNameMap[fieldName],
                    versions: (_a = {},
                        _a[Date.now()] = fieldValue,
                        _a)
                };
                var _a;
            });
            var familyKey = HRow.calcFamilyKey(fieldsNames);
            _this.families[familyKey] = fieldsValues;
        });
    };
    HRow.prototype.getSelectingByFamilyKey = function (familyKey) {
        var valuesMap = {};
        var processingTimeCounter = 0;
        var successful = false;
        var family = this.families[familyKey];
        if (family) {
            for (var fieldName in family) {
                var hCell = family[fieldName];
                valuesMap[fieldName] = Object.assign({}, hCell);
                processingTimeCounter++; // read value
            }
            successful = true;
        }
        return {
            processingTime: processingTimeCounter,
            valuesMap: valuesMap,
            successful: successful
        };
    };
    HRow.prototype.getSelectingByFieldsNames = function (fieldsNames) {
        var processingTimeCounter = 0;
        var valuesMap = {};
        var successful = true;
        for (var familyName in this.families) {
            var family = this.families[familyName];
            for (var fieldName in family) {
                if (fieldsNames.indexOf(fieldName) >= 0) {
                    var hCell = family[fieldName];
                    valuesMap[fieldName] = Object.assign({}, hCell);
                    processingTimeCounter++; // read value
                }
                else {
                    successful = false;
                }
                processingTimeCounter++;
            }
        }
        return {
            processingTime: processingTimeCounter,
            valuesMap: valuesMap,
            successful: successful
        };
    };
    HRow.prototype.readBySelect = function (selectItems) {
        var _this = this;
        var selecting;
        if (selectItems[0] === index_1.SQL_LITERAL_ALL) {
            selecting = this.getSelectingByFieldsNames(this.getFieldsNames());
        }
        else {
            var joinedFieldsNamesMap_1 = {};
            var fieldsNames_1 = [];
            selectItems.map(function (selectItem) {
                var _a = selectItem.split('.').map(function (it) { return it.trim(); }), tableName = _a[0], fieldName = _a[1];
                if (tableName === _this.tableName) {
                    fieldsNames_1.push(fieldName);
                }
                else {
                    // INNER JOIN CASE
                    if (!joinedFieldsNamesMap_1[tableName]) {
                        joinedFieldsNamesMap_1[tableName] = [];
                    }
                    joinedFieldsNamesMap_1[tableName].push(fieldName);
                }
            });
            var familyKey = HRow.calcFamilyKey(fieldsNames_1);
            selecting = this.getSelectingByFamilyKey(familyKey);
            if (!selecting.successful) {
                selecting = this.getSelectingByFieldsNames(fieldsNames_1);
            }
        }
        return selecting;
    };
    HRow.prototype.getIndexedArrowKeys = function () {
        var _this = this;
        var result = [];
        this.getArrowsFromFields().forEach(function (arrow) {
            if (_this.indexedFields.indexOf(arrow.field) >= 0) {
                result.push(HRow.calcArrowKey(arrow));
            }
        });
        return result;
    };
    HRow.prototype.getArrowKeys = function () {
        var result = [];
        this.getArrowsFromFields().forEach(function (arrow) {
            result.push(HRow.calcArrowKey(arrow));
        });
        return result;
    };
    HRow.prototype.getFirstValueFromCell = function (rowCell) {
        var versions = rowCell.versions;
        var tsList = Object.keys(versions);
        return versions[tsList[0]];
    };
    HRow.prototype.getFieldsNames = function () {
        var result = [];
        for (var familyName in this.families) {
            for (var fieldName in this.families[familyName]) {
                result.push(fieldName);
            }
        }
        return result;
    };
    HRow.prototype.getArrowsFromFields = function () {
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
    HRow.prototype.getValueByFieldName = function (name) {
        var result = null;
        for (var it in this.families) {
            var rowCell = this.families[it][name];
            if (rowCell) {
                result = this.getFirstValueFromCell(rowCell);
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
