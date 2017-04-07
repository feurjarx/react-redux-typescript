"use strict";
var RabbitMQ_1 = require("../services/RabbitMQ");
var Expectant_1 = require("./clients/Expectant");
var MasterServer_1 = require("./servers/MasterServer");
var RegionServer_1 = require("./servers/RegionServer");
var MapGenerator_1 = require("./MapGenerator");
var RandomDistribution_1 = require("./servers/behaviors/RandomDistribution");
var Statistics_1 = require("./Statistics");
var RandomSleepCalculating_1 = require("./servers/behaviors/RandomSleepCalculating");
var Life = (function () {
    function Life() {
        var _this = this;
        this.lifeCompleteCallback = Function();
        this.lifeInfoCallback = Function();
        this.bigDataInfoCallback = Function();
        this.startClientsRequests = function (lifeData) {
            var clients = lifeData.clients, requestTimeLimit = lifeData.requestTimeLimit;
            var statistics = _this.statistics;
            var nClients = clients.length;
            clients.forEach(function (clientData) {
                // [clients[0]].forEach(clientData => {
                var nRequests = +clientData['nRequests'];
                var client = new Expectant_1.default(new RabbitMQ_1.default());
                client.requestTimeLimit = requestTimeLimit;
                console.log("\u0421\u043E\u0437\u0434\u0430\u043D \u043D\u043E\u0432\u044B\u0439 \u043A\u043B\u0438\u0435\u043D\u0442 #" + client.id);
                client
                    .requestsToMasterServer(nRequests, function (response) {
                    switch (response.type) {
                        case 'sent':
                            statistics.upRequests();
                            break;
                        case 'stopped':
                            statistics.upCompletedClients();
                            if (statistics.isEqualCompletedClients(nClients)) {
                                statistics.unsubscribeFromAbsBandwidth();
                                _this.lifeCompleteCallback();
                            }
                            break;
                    }
                });
            });
        };
        this.onMasterServerResponse = function (response) {
            var lastProcessingTime = response.lastProcessingTime, requestCounter = response.requestCounter, regionServerId = response.regionServerId;
            _this.lifeInfoCallback({ regionServerId: regionServerId, requestCounter: requestCounter });
            _this.statistics.totalProcessingTime += lastProcessingTime;
        };
    }
    Life.prototype.onLifeComplete = function (callback) {
        if (callback === void 0) { callback = Function(); }
        this.lifeCompleteCallback = callback;
        return this;
    };
    ;
    Life.prototype.onLifeInfo = function (callback) {
        if (callback === void 0) { callback = Function(); }
        this.lifeInfoCallback = callback;
        return this;
    };
    ;
    Life.prototype.onBigDataInfo = function (callback) {
        if (callback === void 0) { callback = Function(); }
        this.bigDataInfoCallback = callback;
        return this;
    };
    Life.prototype.initServers = function (serversData) {
        var masterServer = new MasterServer_1.default(new RabbitMQ_1.default(), serversData.find(function (it) { return it.isMaster; }));
        // masterServer.distrubutionBehavior = new HashDistribution();
        masterServer.distrubutionBehavior = new RandomDistribution_1.default();
        for (var i = 0; i < serversData.length; i++) {
            var serverData = serversData[i];
            if (!serverData.isMaster) {
                var server = new RegionServer_1.default(new RabbitMQ_1.default(), serverData);
                server.calculateBehavior = new RandomSleepCalculating_1.default(200);
                server.id = serverData.name;
                masterServer.subordinates.push(server);
            }
        }
        return masterServer;
    };
    Life.prototype.createBigData = function (data) {
        var tables = data.tables, requiredFilledSize = data.requiredFilledSize;
        var masterServer = this.masterServer;
        var totalSize = requiredFilledSize * 1000;
        MapGenerator_1.default.fillRegions({ tables: tables, totalSize: totalSize }, masterServer);
        var regionsPiesCharts = masterServer.subordinates.map(function (server) { return ({
            serverName: server.id,
            chartData: server.getRegionalStatistics()
        }); });
        this.bigDataInfoCallback({ regionsPiesCharts: regionsPiesCharts });
        this.masterServer = masterServer;
    };
    ;
    Life.prototype.live = function (lifeData) {
        var servers = lifeData.servers;
        var masterServer = this.masterServer = this.initServers(servers);
        this.createBigData(lifeData);
        var nServers = masterServer.subordinates.length;
        var statistics = new Statistics_1.default({ nServers: nServers });
        var _a = this, startClientsRequests = _a.startClientsRequests, onMasterServerResponse = _a.onMasterServerResponse;
        this.subscribtion = masterServer
            .ready(startClientsRequests.bind(this, lifeData)) // start
            .subscribe(onMasterServerResponse); // final
        // statistics.subscribeToAbsBandwidth(absBandwidth => this.lifeInfoCallback({
        //     type: 'load_line',
        //     absBandwidth
        // }));
        this.statistics = statistics;
        return this;
    };
    ;
    Life.prototype.destroy = function () {
        this.subscribtion.unsubscribe();
        this.masterServer.close();
    };
    return Life;
}());
exports.Life = Life;
