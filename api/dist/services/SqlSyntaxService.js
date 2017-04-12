"use strict";
var index_1 = require("../helpers/index");
var index_2 = require("../constants/index");
var SqlSyntaxService = (function () {
    function SqlSyntaxService() {
    }
    Object.defineProperty(SqlSyntaxService, "instance", {
        get: function () {
            if (!this._instance) {
                this._instance = new SqlSyntaxService();
            }
            return this._instance;
        },
        enumerable: true,
        configurable: true
    });
    SqlSyntaxService.prototype.getAndsListFromWhere = function (where) {
        if (where === void 0) { where = ''; }
        where = where.toLowerCase();
        var ins = [];
        var ors = [];
        where.split('or').forEach(function (orCase) {
            orCase = orCase.trim();
            var ands = [];
            orCase.split('and').forEach(function (andCase) {
                andCase = andCase.trim();
                for (var i = 0; i < index_2.SQL_OPERATORS.length; i++) {
                    var operator = index_2.SQL_OPERATORS[i];
                    var _a = andCase.split(operator).map(function (it) { return it.trim(); }), left = _a[0], value = _a[1];
                    if (value) {
                        if (operator === 'in') {
                            ins.push(andCase);
                            continue;
                        }
                        var _b = left.split('.'), table = _b[0], field = _b[1];
                        value = index_1.qtrim(value);
                        ands.push({
                            table: table,
                            field: field,
                            operator: operator,
                            value: value,
                            isPrimaryField: field === 'id'
                        });
                        break;
                    }
                }
            });
            if (ands.length) {
                ors.push(ands);
            }
        });
        // operator IN transformation to {'or', '='}
        ins.forEach(function (inItem) {
            var _a = inItem.split('in').map(function (it) { return it.trim(); }), left = _a[0], right = _a[1];
            var _b = left.split('.'), table = _b[0], field = _b[1];
            right = right.slice(1, -1); // remove '(' and ')'
            var inValues = right.split(',');
            inValues.forEach(function (v) {
                ors.push([{
                        table: table,
                        field: field,
                        operator: index_2.SQL_OPERATOR_EQ,
                        value: index_1.qtrim(v),
                        isPrimaryField: field === 'id'
                    }]);
            });
        });
        return ors;
    };
    return SqlSyntaxService;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SqlSyntaxService;
