"use strict";
var Server_1 = require("./Server");
var RabbitMQ_1 = require("../services/RabbitMQ");
var Expectant_1 = require("./clients/Expectant");
var RandomSleepCalculating_1 = require("./servers/RandomSleepCalculating");
var Life = (function () {
    function Life() {
        this.servers = [];
        this.clients = [];
    }
    Life.prototype.live = function (data, callback, complete) {
        if (callback === void 0) { callback = null; }
        if (complete === void 0) { complete = null; }
        console.log(data);
        var nClients = data.nClients, nServers = data.nServers, requestTimeLimit = data.requestTimeLimit;
        var _a = this, servers = _a.servers, clients = _a.clients;
        var timerId;
        var completedClientsCounter = 0;
        var requestsCounter = 0;
        for (var i = 0; i < nServers; i++) {
            var server = new Server_1.default(new RabbitMQ_1.default());
            server.calculateBehavior = new RandomSleepCalculating_1.default(5000);
            server.id = i;
            server.listen(function (data) {
                if (callback instanceof Function) {
                    var _a = this, id = _a.id, requestCounter = _a.requestCounter; // server
                    // console.log({id, requestCounter});
                    callback({
                        id: id,
                        requestCounter: requestCounter
                    });
                }
                if (data.last) {
                    completedClientsCounter++;
                    clearInterval(timerId);
                    if (completedClientsCounter === nClients && complete instanceof Function) {
                        complete();
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
        timerId = setInterval(function () {
            time += 4;
            var absThroughput = requestsCounter / nServers / time;
            callback({
                type: 'load',
                absThroughput: absThroughput
            });
            console.log("**** AbsThroughput = " + absThroughput);
        }, 4);
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
