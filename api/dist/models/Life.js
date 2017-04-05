"use strict";
var Server_1 = require("./Server");
var RabbitMQ_1 = require("../services/RabbitMQ");
var Expectant_1 = require("./clients/Expectant");
var RandomSleepCalculating_1 = require("./servers/RandomSleepCalculating");
var MasterServer_1 = require("./servers/MasterServer");
var RegionServer_1 = require("./servers/RegionServer");
var MapGenerator_1 = require("./MapGenerator");
var RandomDistribution_1 = require("./servers/RandomDistribution");
var Life = (function () {
    function Life() {
        this.servers = [];
        this.clients = [];
    }
    Life.prototype.initServers = function (serversData) {
        var masterServer = new MasterServer_1.default(new RabbitMQ_1.default(), serversData.find(function (it) { return it.isMaster; }));
        // masterServer.distrubutionBehavior = new HashDistribution();
        masterServer.distrubutionBehavior = new RandomDistribution_1.default();
        for (var i = 0; i < serversData.length; i++) {
            var serverData = serversData[i];
            if (!serverData.isMaster) {
                var server = new RegionServer_1.default(serverData);
                server.id = serverData.name;
                masterServer.subordinates.push(server);
            }
        }
        return masterServer;
    };
    Life.prototype.preLive = function (data, done) {
        if (done === void 0) { done = Function(); }
        console.log(data);
        var tables = data.tables, servers = data.servers;
        var masterServer = this.initServers(servers);
        MapGenerator_1.default.fillRegions({ tables: tables, totalSize: 500000 }, masterServer);
        var regionsServersPies = masterServer.subordinates.map(function (server) { return ({
            serverName: server.id,
            chartData: server.calcRegionsSizes()
        }); });
        done({ regionsServersPies: regionsServersPies });
        this.masterServer = masterServer;
    };
    ;
    Life.prototype.live = function (data, callback, complete) {
        if (callback === void 0) { callback = null; }
        if (complete === void 0) { complete = null; }
        console.log(data);
        var nClients = data.nClients, nServers = data.nServers, requestTimeLimit = data.requestTimeLimit;
        var _a = this, servers = _a.servers, clients = _a.clients;
        var timerId;
        var completedClientsCounter = 0;
        var requestsCounter = 0;
        var totalProcessingTimeCounter = 0;
        for (var i = 0; i < nServers; i++) {
            var server = new Server_1.default(new RabbitMQ_1.default());
            server.calculateBehavior = new RandomSleepCalculating_1.default(5000);
            server.id = i;
            server.listen(function (data) {
                if (callback instanceof Function) {
                    var _a = this, id = _a.id, requestCounter = _a.requestCounter, processingTimeCounter = _a.processingTimeCounter, lastProcessingTime = _a.lastProcessingTime; // server
                    console.log({ id: id, requestCounter: requestCounter, processingTimeCounter: processingTimeCounter });
                    callback({
                        id: id,
                        requestCounter: requestCounter
                    });
                    totalProcessingTimeCounter += lastProcessingTime;
                }
                if (data.last) {
                    completedClientsCounter++;
                    if (completedClientsCounter === nClients) {
                        clearInterval(timerId);
                        if (complete instanceof Function) {
                            complete();
                        }
                    }
                }
            });
            servers.push(server);
        }
        data.clients.forEach(function (clientData) {
            var client = new Expectant_1.default(new RabbitMQ_1.default());
            client.requestsNumber = +clientData['requestsNumber'];
            client.requestTimeLimit = requestTimeLimit;
            client
                .requestToServer()
                .subscribe(function (response) {
                if (response.type === 'sent') {
                    requestsCounter++;
                }
            });
            clients.push(client);
        });
        var time = 0;
        var interval = 300;
        timerId = setInterval(function () {
            time += interval;
            // const absThroughput = requestsCounter / nServers / time;
            var absThroughput = totalProcessingTimeCounter / nServers / time;
            callback({
                type: 'load_line',
                absThroughput: absThroughput
            });
            console.log("**** AbsThroughput = " + absThroughput);
        }, interval);
    };
    ;
    Life.prototype.clear = function () {
        var servers = this.servers;
        if (servers.length) {
            servers.forEach(function (s) { return s.close(); });
        }
        this.servers = [];
        this.clients = [];
    };
    return Life;
}());
exports.Life = Life;
