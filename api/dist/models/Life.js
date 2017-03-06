"use strict";
var Server_1 = require("./Server");
var RabbitMQ_1 = require("../services/RabbitMQ");
var Expectant_1 = require("./clients/Expectant");
var SleepCalculating_1 = require("./servers/SleepCalculating");
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
            server.setCalculateBehavior(new SleepCalculating_1.default(100));
            server.id = i;
            server.listen(function () {
                if (callback instanceof Function) {
                    var _a = this, id = _a.id, requestCounter = _a.requestCounter;
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
        var _a = this, servers = _a.servers, clients = _a.clients;
        if (servers.length) {
            servers.forEach(function (s) { return s.close(); });
        }
        this.servers = [];
        this.clients = [];
    };
    return Life;
}());
exports.Life = Life;
