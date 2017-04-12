"use strict";
var RabbitMQ_1 = require("../services/RabbitMQ");
var Expectant_1 = require("./clients/Expectant");
var MasterServer_1 = require("./servers/MasterServer");
var SlaveServer_1 = require("./servers/SlaveServer");
var MapGenerator_1 = require("./MapGenerator");
var Statistics_1 = require("./Statistics");
var calculate_1 = require("./servers/behaviors/calculate");
var SocketLogEmitter_1 = require("../services/SocketLogEmitter");
var index_1 = require("./servers/behaviors/slave-selecting/index");
var index_2 = require("../constants/index");
var Life = (function () {
    function Life() {
        var _this = this;
        this.lifeCompleteCallback = Function();
        this.lifeInfoCallback = Function();
        this.bigDataInfoCallback = Function();
        this.startClientsRequests = function (lifeData) {
            var clients = lifeData.clients, requestTimeLimit = lifeData.requestTimeLimit, requestsLimit = lifeData.requestsLimit, sqls = lifeData.sqls;
            SocketLogEmitter_1.default.instance.setBatchSize(requestsLimit * clients.length);
            clients.forEach(function (clientData) {
                // [clients[0]].forEach(clientData => {
                var nRequests = +clientData['nRequests'];
                var client = new Expectant_1.default(new RabbitMQ_1.default(), sqls);
                client.requestTimeLimit = requestTimeLimit;
                console.log("\u0421\u043E\u0437\u0434\u0430\u043D \u043D\u043E\u0432\u044B\u0439 \u043A\u043B\u0438\u0435\u043D\u0442 #" + client.id);
                client
                    .requestsToMasterServer(nRequests, _this.onMasterResponse);
            });
        };
        this.onMasterResponse = function (response) {
            var statistics = _this.statistics;
            switch (response.type) {
                case index_2.RESPONSE_TYPE_SENT:
                    statistics.upRequests();
                    break;
                case index_2.RESPONSE_TYPE_RECEIVED:
                    var processingTime = response.processingTime, slavesPiesData = response.slavesPiesData, error = response.error;
                    if (error === 404) {
                        statistics.upUnsuccessufulRequests();
                    }
                    else {
                        slavesPiesData.forEach(function (_a) {
                            var slaveId = _a.slaveId, requestCounter = _a.requestCounter;
                            _this.lifeInfoCallback({ slaveId: slaveId, requestCounter: requestCounter });
                        });
                        statistics.totalProcessingTime += processingTime;
                    }
                    break;
                case index_2.RESPONSE_TYPE_STOPPED:
                    statistics.upCompletedClients();
                    if (statistics.isEqualCompletedClients()) {
                        statistics.unsubscribeFromAbsBandwidth();
                        _this.lifeCompleteCallback();
                    }
                    break;
            }
        };
    }
    Life.initServers = function (serversData) {
        var masterServer = new MasterServer_1.default(new RabbitMQ_1.default());
        // masterServer.slaveSelectingBehavior = RandomSlaveSelecting.instance;
        masterServer.slaveSelectingBehavior = index_1.TestSlaveSelecting.instance;
        for (var i = 0; i < serversData.length; i++) {
            var serverData = serversData[i];
            if (!serverData.isMaster) {
                var server = new SlaveServer_1.default(new RabbitMQ_1.default(), serverData);
                server.calculateBehavior = new calculate_1.RandomSleepCalculating(200);
                server.id = serverData.name;
                masterServer.subordinates.push(server);
            }
        }
        return masterServer;
    };
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
    Life.prototype.createCluster = function (data) {
        var tables = data.tables, dbSize = data.dbSize;
        var masterServer = this.masterServer;
        // const totalSize = dbSize * 1000;
        MapGenerator_1.default.fillRegions({ tables: tables }, masterServer);
        var regionsPiesCharts = masterServer.subordinates.map(function (server) { return ({
            serverName: server.id,
            chartData: server.getRegionalStatistics()
        }); });
        this.bigDataInfoCallback({ regionsPiesCharts: regionsPiesCharts });
        this.masterServer = masterServer;
    };
    ;
    Life.prototype.simulateWorkWithBigData = function (lifeData) {
        var _this = this;
        this.masterServer.prepare().then(function () {
            console.log("\u0412\u0441\u0435 \u0440\u0435\u0433\u0438\u043E\u043D-\u0441\u0435\u0440\u0432\u0435\u0440\u0430 \u0433\u043E\u0442\u043E\u0432\u044B.");
            _this.startClientsRequests(lifeData);
        });
    };
    Life.prototype.live = function (lifeData) {
        var servers = lifeData.servers, clients = lifeData.clients;
        if (!servers.find(function (it) { return it.isMaster; })) {
            this.lifeCompleteCallback();
            return;
        }
        this.masterServer = Life.initServers(servers);
        if (!this.masterServer.getSlavesNumber()) {
            this.lifeCompleteCallback();
            return;
        }
        this.createCluster(lifeData);
        this.statistics = new Statistics_1.default({
            nServers: servers.length,
            nClients: clients.length
        });
        this.simulateWorkWithBigData(lifeData);
        // statistics.subscribeToAbsBandwidth(absBandwidth => this.lifeInfoCallback({
        //     type: 'load_line',
        //     absBandwidth
        // }));
    };
    ;
    Life.prototype.destroy = function () {
        this.masterServer.close();
    };
    return Life;
}());
exports.Life = Life;
