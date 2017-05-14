"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var Server_1 = require("../Server");
var HRow_1 = require("../HRow");
var HRegion_1 = require("../HRegion");
var helpers_1 = require("../../helpers");
var index_1 = require("../../constants/index");
var SqlSyntaxService_1 = require("../../services/SqlSyntaxService");
var GlobalCounter_1 = require("../../services/GlobalCounter");
var global_counter_1 = require("../../constants/global-counter");
var SlaveServer = (function (_super) {
    __extends(SlaveServer, _super);
    function SlaveServer(provider, serverData) {
        var _this = _super.call(this, provider, serverData) || this;
        _this.rowsKeysByArrowKeyMap = {};
        _this.regionIdByRowKeyMap = {};
        _this.successfulCounter = 0;
        _this.onClientRequestFromMaster = function (request) {
            var sqlQueryParts = request.sqlQueryParts, clientId = request.clientId, subKey = request.subKey;
            var onMasterReply = request.onReply;
            console.log("\u0420\u0435\u0433\u0438\u043E\u043D \u0441\u0435\u0440\u0432\u0435\u0440 #" + _this.id + " \u043F\u043E\u043B\u0443\u0447\u0438\u043B \u0437\u0430\u043F\u0440\u043E\u0441 \u043A\u043B\u0438\u0435\u043D\u0442\u0430 #" + clientId + ": " + sqlQueryParts.raw);
            _this.requestsCounter++;
            _this.calculateBehavior
                .calculate()
                .then(function () {
                console.log("\u0420\u0435\u0433\u0438\u043E\u043D \u0441\u0435\u0440\u0432\u0435\u0440 #" + _this.id + " \u043E\u0442\u043F\u0440\u0430\u0432\u0438\u043B \u043C\u0430\u0441\u0442\u0435\u0440\u0443 \u043E\u0442\u0432\u0435\u0442 \u043D\u0430 \u0437\u0430\u043F\u0440\u043E\u0441 \u043A\u043B\u0438\u0435\u043D\u0442\u0430 #" + clientId);
                onMasterReply(__assign({ subKey: subKey,
                    clientId: clientId, slaveId: _this.id, requestsCounter: _this.requestsCounter, failedCounter: _this.failedCounter }, _this.read(sqlQueryParts)));
            });
        };
        _this.regions = [];
        var maxRegions = serverData.maxRegions, _a = serverData.distanceToMasterKm, distanceToMasterKm = _a === void 0 ? 0 : _a;
        var hdd = serverData.hdd;
        hdd = index_1.HDD_ASPECT_RATIO * hdd;
        _this.hdd = hdd;
        _this.maxRegions = maxRegions;
        _this.distanceToMasterKm = distanceToMasterKm;
        var regionMaxSize = Math.round(hdd / maxRegions);
        _this.regions = helpers_1.range(0, maxRegions)
            .map(function (id) { return new HRegion_1.default(id, _this.id, regionMaxSize); });
        _this.regionMaxSize = regionMaxSize;
        _this.id = serverData.name;
        return _this;
    }
    ;
    SlaveServer.prototype.calcTransferTime = function () {
        return Math.round((this.distanceToMasterKm / 100) * SlaveServer.timePer100Km);
    };
    SlaveServer.prototype.getRegionalStatistics = function () {
        var _this = this;
        return this.regions.map(function (r) { return ({
            name: "\u0420\u0435\u0433\u0438\u043E\u043D " + r.id + " \u0441\u0435\u0440\u0432\u0435\u0440\u0430 " + _this.id + " (\u0432\u0441\u0435\u0433\u043E: " + Math.round(r.maxSize / index_1.HDD_ASPECT_RATIO * _this.regions.length) + ")",
            value: (r.maxSize - r.freeSpace) / index_1.HDD_ASPECT_RATIO,
            free: r.freeSpace / index_1.HDD_ASPECT_RATIO // for log
        }); });
    };
    SlaveServer.prototype.updateAllGuideMaps = function (hRow, regionId) {
        var _this = this;
        this.regionIdByRowKeyMap[hRow.rowKey] = regionId;
        hRow.getIndexedArrowKeys().forEach(function (arrowKey) {
            if (!_this.rowsKeysByArrowKeyMap[arrowKey]) {
                _this.rowsKeysByArrowKeyMap[arrowKey] = [];
            }
            _this.rowsKeysByArrowKeyMap[arrowKey].push(hRow.rowKey);
        });
    };
    SlaveServer.prototype.save = function (hRow) {
        var _this = this;
        var regions = this.regions;
        var completed = false;
        var needSplitedRegions = [];
        for (var i = 0; i < regions.length; i++) {
            var region = regions[i];
            if (region.isFitIn(hRow.getSize())) {
                region.add(hRow);
                completed = true;
                this.updateAllGuideMaps(hRow, region.id);
                break;
            }
            else {
                needSplitedRegions.push(region);
            }
        }
        needSplitedRegions.forEach(function (region) {
            _this.split(region);
        });
        // console.log(this.getRegionalStatistics());
        return completed;
    };
    SlaveServer.prototype.getRegionById = function (id) {
        return this.regions.find(function (r) { return r.id === id; });
    };
    SlaveServer.prototype.split = function (region) {
        if (Object.keys(region.rows).length) {
            var rowsList = region.popHalf();
            var regions = this.regions;
            var filledRegionsIds = regions
                .filter(function (r) { return r.id != region.id; })
                .map(function (r) { return r.id; });
            for (var i = 0; i < rowsList.length; i++) {
                var nextRegionId = filledRegionsIds[i % filledRegionsIds.length];
                var hRow = rowsList[i];
                regions[nextRegionId].add(hRow);
                this.updateAllGuideMaps(hRow, nextRegionId);
            }
        }
    };
    SlaveServer.prototype.listenExchange = function (exchange) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.subscription = _this.provider
                .consumeByRouteKeys(exchange, [_this.id], { resolve: resolve })
                .subscribe(_this.onClientRequestFromMaster);
        });
    };
    SlaveServer.prototype.read = function (sqlQueryParts) {
        var _this = this;
        if (this.hasFailed()) {
            return {
                processingTime: 0,
                selectings: [],
                found: 0
            };
        }
        var currentSuccessfulCounter = 0;
        var processingTimeCounter = 0;
        var selectings = [];
        if (sqlQueryParts.where) {
            SqlSyntaxService_1.default.instance
                .getAndsListFromWhere(sqlQueryParts.where)
                .forEach(function (ands) {
                var usefulRowsKeys = [];
                var comparator = null;
                var skip = false;
                var _loop_1 = function (i) {
                    var criteria = ands[i];
                    switch (criteria.operator) {
                        case index_1.SQL_OPERATOR_EQ:
                            var arrowKey = HRow_1.default.calcArrowKey(criteria);
                            var rowsKeys = _this.rowsKeysByArrowKeyMap[arrowKey] || [];
                            if (rowsKeys.length) {
                                GlobalCounter_1.GlobalCounter.up(global_counter_1.GLOBAL_COUNTER_SQL_QUICK);
                                usefulRowsKeys.push.apply(usefulRowsKeys, rowsKeys);
                            }
                            else {
                                GlobalCounter_1.GlobalCounter.up(global_counter_1.GLOBAL_COUNTER_SQL_NORMAL);
                                comparator = function (a, b) { return a == b; };
                            }
                            break;
                        case index_1.SQL_OPERATOR_LT:
                            comparator = function (a, b) { return a < b; };
                            break;
                        case index_1.SQL_OPERATOR_GT:
                            comparator = function (a, b) { return a > b; };
                            break;
                        default:
                            throw new Error('Unexpected operator');
                    }
                    if (comparator) {
                        var table_1 = criteria.table, field_1 = criteria.field, value_1 = criteria.value;
                        var rowsKeys = _this
                            .filterRows(function (hRow) {
                            processingTimeCounter++;
                            return (hRow.tableName === table_1
                                &&
                                    comparator(hRow.getValueByFieldName(field_1), value_1));
                        })
                            .map(function (hRow) { return hRow.rowKey; });
                        if (rowsKeys.length) {
                            usefulRowsKeys.push.apply(usefulRowsKeys, rowsKeys);
                        }
                        else {
                            skip = true;
                        }
                    }
                };
                for (var i = 0; i < ands.length && !skip; i++) {
                    _loop_1(i);
                }
                if (!skip) {
                    helpers_1.unique(usefulRowsKeys).forEach(function (rowKey) {
                        var regionId = _this.regionIdByRowKeyMap[rowKey];
                        var usefulHRow = _this.getRegionById(regionId).rows[rowKey];
                        if (usefulHRow) {
                            var selecting = usefulHRow.readBySelect(sqlQueryParts.select);
                            processingTimeCounter += selecting.processingTime;
                            selectings.push(selecting);
                            currentSuccessfulCounter++;
                        }
                        else {
                            throw new Error('Запись есть в guide maps, но нет в регионе');
                        }
                    });
                }
            });
        }
        else if (!sqlQueryParts.join) {
            var tableName_1 = sqlQueryParts.from[0];
            this
                .filterRows(function (hRow) {
                processingTimeCounter++;
                return hRow.tableName === tableName_1;
            })
                .map(function (usefulHRow) {
                var selecting = usefulHRow.readBySelect(sqlQueryParts.select);
                processingTimeCounter += selecting.processingTime;
                selectings.push(selecting);
                currentSuccessfulCounter++;
            });
        }
        this.successfulCounter += currentSuccessfulCounter;
        return {
            processingTime: processingTimeCounter,
            selectings: selectings,
            found: currentSuccessfulCounter
        };
    };
    SlaveServer.prototype.filterRows = function (criteriaFn) {
        var result = [];
        this.regions.forEach(function (r) {
            var rows = r.rows;
            for (var rowKey in rows) {
                var usefulHRow = rows[rowKey];
                if (criteriaFn(usefulHRow)) {
                    result.push(usefulHRow);
                }
            }
        });
        return result;
    };
    return SlaveServer;
}(Server_1.default));
SlaveServer.timePer100Km = 1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SlaveServer;
