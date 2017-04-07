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
var rxjs_1 = require("rxjs");
var rabbitmq_1 = require("./../../constants/rabbitmq");
var index_1 = require("../../helpers/index");
var MasterServer = (function (_super) {
    __extends(MasterServer, _super);
    function MasterServer(provider, serverData) {
        var _this = _super.call(this, provider) || this;
        _this.subscriptionsMap = {};
        var isMaster = serverData.isMaster;
        _this.isMaster = isMaster;
        _this.subordinates = [];
        return _this;
    }
    ;
    MasterServer.prototype.save = function (hRow) {
        var getRegionServerNo = this.distrubutionBehavior.getRegionServerNo;
        var serverRegionNo = getRegionServerNo(hRow, this.subordinates.length);
        this.subordinates[serverRegionNo].save(hRow);
        console.log("Region no " + serverRegionNo);
    };
    MasterServer.prototype.ready = function (complete) {
        var _this = this;
        if (complete === void 0) { complete = Function(); }
        return new rxjs_1.Observable(function (observer) {
            _this.listen(rabbitmq_1.RABBITMQ_QUEUE_MASTER_SERVER, function (response) { return observer.next(response); });
            var promises = [];
            _this.subordinates.forEach(function (regionServer) {
                promises.push(regionServer.listenExchange(rabbitmq_1.RABBITMQ_EXCHANGE_REGION_SERVERS));
            });
            Promise.all(promises).then(function () {
                console.log("\u0412\u0441\u0435 \u0440\u0435\u0433\u0438\u043E\u043D-\u0441\u0435\u0440\u0432\u0435\u0440\u0430 \u0433\u043E\u0442\u043E\u0432\u044B.");
                complete();
            });
        });
    };
    MasterServer.prototype.listen = function (queueName, callback, lazy) {
        var _this = this;
        if (callback === void 0) { callback = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
        }; }
        if (lazy === void 0) { lazy = false; }
        console.log('Мастер-сервер ожидает запросы...');
        var observable = new rxjs_1.Observable(function (observer) {
            _this.provider
                .consume(queueName, { lazy: lazy })
                .subscribe(function (response) {
                // from Clients
                var onClientReply = response.onClientReply, clientId = response.clientId;
                console.log("\u041C\u0430\u0441\u0442\u0435\u0440-\u0441\u0435\u0440\u0432\u0435\u0440 \u043F\u043E\u043B\u0443\u0447\u0438\u043B \u0437\u0430\u043F\u0440\u043E\u0441 \u043E\u0442 \u043A\u043B\u0438\u0435\u043D\u0442\u0430 #" + clientId);
                var getRegionServerNo = _this.distrubutionBehavior.getRegionServerNo;
                var serverRegionNo = getRegionServerNo(null, _this.subordinates.length);
                var regionServer = _this.subordinates[serverRegionNo];
                console.log("\u041C\u0430\u0441\u0442\u0435\u0440-\u0441\u0435\u0440\u0432\u0435\u0440 \u043F\u0435\u0440\u0435\u043D\u0430\u043F\u0440\u0430\u0432\u043B\u044F\u0435\u0442 \u0437\u0430\u043F\u0440\u043E\u0441 \u043E\u0442 \u043A\u043B\u0438\u0435\u043D\u0442\u0430 #" + clientId + " \u043D\u0430 \u0440\u0435\u0433\u0438\u043E\u043D-\u0441\u0435\u0440\u0432\u0435\u0440 #" + regionServer.id);
                _this
                    .redirectToRegionServer(regionServer, { clientId: clientId })
                    .then(function (responseFromRegionServer) {
                    onClientReply(responseFromRegionServer);
                    observer.next(responseFromRegionServer);
                });
            });
        });
        this.subscriptionForClients = observable.subscribe(callback);
    };
    MasterServer.prototype.redirectToRegionServer = function (regionServer, data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var routeKey = regionServer.id;
            var subKey = index_1.hash(routeKey, Date.now());
            _this.subscriptionsMap[subKey] = _this.provider
                .publishAndWaitByRouteKeys(rabbitmq_1.RABBITMQ_EXCHANGE_REGION_SERVERS, [routeKey], __assign({}, data, { subKey: subKey }))
                .subscribe(function (response) {
                // from RegionServer
                switch (response.type) {
                    case 'sent':
                        break;
                    case 'received':
                        var regionServerId = response.regionServerId, clientId = response.clientId, subKey_1 = response.subKey;
                        console.log("\u041C\u0430\u0441\u0442\u0435\u0440-\u0441\u0435\u0440\u0432\u0435\u0440 \u043F\u043E\u043B\u0443\u0447\u0438\u043B \u043E\u0442\u0432\u0435\u0442 \u0441 \u0440\u0435\u0433\u0438\u043E\u043D-\u0441\u0435\u0440\u0432\u0435\u0440\u0430 " + regionServerId + " \u043D\u0430 \u0437\u0430\u043F\u0440\u043E\u0441 \u043E\u0442 \u043A\u043B\u0438\u0435\u043D\u0442\u0430 #" + clientId);
                        resolve(response);
                        _this.subscriptionsMap[subKey_1].unsubscribe();
                        break;
                    default:
                        throw new Error("Unexpected response type from server. Type: " + response.type);
                }
            });
        });
    };
    MasterServer.prototype.close = function () {
        _super.prototype.close.call(this);
        this.subordinates.forEach(function (s) { return s.close(); });
    };
    return MasterServer;
}(Server_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MasterServer;
