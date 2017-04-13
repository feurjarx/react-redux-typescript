"use strict";
var RabbitMQ_1 = require("../services/RabbitMQ");
var Expectant_1 = require("./clients/Expectant");
var MasterServer_1 = require("./servers/MasterServer");
var SlaveServer_1 = require("./servers/SlaveServer");
var MapGenerator_1 = require("./MapGenerator");
var Statistics_1 = require("./Statistics");
var calculate_1 = require("./servers/behaviors/calculate");
var SocketLogEmitter_1 = require("../services/SocketLogEmitter");
var index_1 = require("../constants/index");
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
                console.log("\u0421\u043E\u0437\u0434\u0430\u043D \u043D\u043E\u0432\u044B\u0439 \u043A\u043B\u0438\u0435\u043D\u0442: #" + client.id);
                client.requestsToMasterServer(nRequests, _this.onMasterResponse);
            });
        };
        this.onMasterResponse = function (response) {
            var statistics = _this.statistics;
            switch (response.type) {
                case index_1.RESPONSE_TYPE_SENT:
                    statistics.upRequests();
                    break;
                case index_1.RESPONSE_TYPE_RECEIVED:
                    var slavesRequestsDiagramData = response.slavesRequestsDiagramData, slavesProcessingTimeList = response.slavesProcessingTimeList, processingTime = response.processingTime, error = response.error;
                    if (error === 404) {
                        statistics.upUnsuccessufulRequests();
                    }
                    else {
                        slavesRequestsDiagramData.forEach(function (chartData) {
                            _this.lifeInfoCallback(chartData, index_1.CHART_TYPE_REQUESTS_DIAGRAM);
                        });
                        slavesProcessingTimeList.forEach(function (time, i) {
                            _this.statistics.setLastProcessingTime(i, time);
                        });
                        statistics.totalProcessingTime += processingTime;
                    }
                    break;
                case index_1.RESPONSE_TYPE_STOPPED:
                    statistics.upCompletedClients();
                    if (statistics.isEqualCompletedClients()) {
                        statistics.unsubscribeFromProp(Statistics_1.default.SLAVES_LAST_PROCESSING_TIME_LIST);
                        _this.lifeCompleteCallback();
                        setTimeout(function () {
                            _this.masterServer.close();
                            _this.active = false;
                            SocketLogEmitter_1.default.instance.emitForce(); // остаток логов на выпуск
                        }, 5000);
                    }
                    break;
            }
        };
    }
    Life.initServers = function (serversData) {
        var masterServer = new MasterServer_1.default(new RabbitMQ_1.default());
        for (var i = 0; i < serversData.length; i++) {
            var serverData = serversData[i];
            if (!serverData.isMaster) {
                var server = new SlaveServer_1.default(new RabbitMQ_1.default(), serverData);
                server.calculateBehavior = new calculate_1.RandomSleepCalculating(500);
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
        var tables = data.tables;
        var masterServer = this.masterServer;
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
        var _this = this;
        this.active = true;
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
        this.statistics.subscribeToProp(Statistics_1.default.SLAVES_LAST_PROCESSING_TIME_LIST, function (data) { return _this.lifeInfoCallback(data, index_1.CHART_TYPE_SLAVES_LOAD); });
    };
    ;
    Life.prototype.destroy = function () {
        this.masterServer.close();
    };
    return Life;
}());
exports.Life = Life;
