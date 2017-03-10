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
    Life.prototype.live = function (data, callback) {
        if (callback === void 0) { callback = null; }
        console.log(data);
        var nClients = data.nClients, nServers = data.nServers;
        var _a = this, servers = _a.servers, clients = _a.clients;
        for (var i = 0; i < nServers; i++) {
            var server = new Server_1.default(new RabbitMQ_1.default());
            server.setCalculateBehavior(new RandomSleepCalculating_1.default(5000));
            server.id = i;
            server.listen(function () {
                if (callback instanceof Function) {
                    var _a = this, id = _a.id, requestCounter = _a.requestCounter;
                    console.log({ id: id, requestCounter: requestCounter });
                    debugger;
                    callback({
                        id: id,
                        requestCounter: requestCounter
                    });
                }
            });
            servers.push(server);
        }
        for (var i = 0; i < nClients; i++) {
            var client = new Expectant_1.default();
            client.requestServer();
            clients.push(client);
        }
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
