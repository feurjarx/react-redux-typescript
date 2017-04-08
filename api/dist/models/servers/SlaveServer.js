"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Server_1 = require("../Server");
var HRegion_1 = require("../HRegion");
var helpers_1 = require("../../helpers");
var SlaveServer = (function (_super) {
    __extends(SlaveServer, _super);
    function SlaveServer(provider, serverData) {
        var _this = _super.call(this, provider) || this;
        _this.onRequestFromMasterServer = function (data) {
            var onClientReply = data.onClientReply, clientId = data.clientId, subKey = data.subKey;
            console.log("\u0420\u0435\u0433\u0438\u043E\u043D \u0441\u0435\u0440\u0432\u0435\u0440 #" + _this.id + " \u043F\u043E\u043B\u0443\u0447\u0438\u043B \u043E\u0442 \u043C\u0430\u0441\u0442\u0435\u0440\u0430 \u0437\u0430\u043F\u0440\u043E\u0441 \u043A\u043B\u0438\u0435\u043D\u0442\u0430 #" + clientId);
            _this.requestCounter++;
            // TODO: read or write regions
            _this.calculateBehavior
                .calculate()
                .then(function () {
                console.log("\u0420\u0435\u0433\u0438\u043E\u043D \u0441\u0435\u0440\u0432\u0435\u0440 #" + _this.id + " \u043E\u0442\u043F\u0440\u0430\u0432\u0438\u043B \u043C\u0430\u0441\u0442\u0435\u0440\u0443 \u043E\u0442\u0432\u0435\u0442 \u043D\u0430 \u0437\u0430\u043F\u0440\u043E\u0441 \u043A\u043B\u0438\u0435\u043D\u0442\u0430 #" + clientId);
                onClientReply({
                    subKey: subKey,
                    clientId: clientId,
                    slaveServerId: _this.id,
                    lastProcessingTime: 0,
                    requestCounter: _this.requestCounter
                });
            });
        };
        _this.regions = [];
        var hdd = serverData.hdd, maxRegions = serverData.maxRegions;
        _this.hdd = hdd;
        _this.maxRegions = maxRegions;
        var regionMaxSize = Math.round(hdd / maxRegions);
        _this.regions = helpers_1.range(0, maxRegions)
            .map(function (id) { return new HRegion_1.default(id, _this.id, regionMaxSize); });
        _this.regionMaxSize = regionMaxSize;
        return _this;
    }
    ;
    SlaveServer.prototype.getRegionalStatistics = function () {
        var _this = this;
        return this.regions.map(function (r) { return ({
            name: "\u0420\u0435\u0433\u0438\u043E\u043D " + r.id + " \u0441\u0435\u0440\u0432\u0435\u0440\u0430 " + _this.id,
            value: r.maxSize - r.freeSpace
        }); });
    };
    SlaveServer.prototype.save = function (hRow) {
        var regions = this.regions;
        var completed = false;
        for (var i = 0; i < regions.length; i++) {
            var region = regions[i];
            if (region.isFitIn(hRow.getSize())) {
                region.add(hRow);
                completed = true;
                break;
            }
            else {
                this.split(region);
            }
        }
        return completed;
    };
    SlaveServer.prototype.split = function (hRegion) {
        if (Object.keys(hRegion.rows).length) {
            var rowsList = hRegion.popHalf();
            var regions = this.regions;
            var filledRegionsIds = regions
                .filter(function (r) { return r.id != hRegion.id; })
                .map(function (r) { return r.id; });
            for (var i = 0; i < rowsList.length; i++) {
                var regionId = filledRegionsIds[i % filledRegionsIds.length];
                regions[regionId].add(rowsList[i]);
            }
        }
    };
    SlaveServer.prototype.listenExchange = function (exchange) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.subscription = _this.provider
                .consumeByRouteKeys(exchange, [_this.id], { resolve: resolve })
                .subscribe(_this.onRequestFromMasterServer);
        });
    };
    return SlaveServer;
}(Server_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SlaveServer;
