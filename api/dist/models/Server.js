"use strict";
var index_1 = require("../helpers/index");
var Server = (function () {
    function Server(provider, serverData) {
        if (provider === void 0) { provider = null; }
        this.requestsCounter = 0;
        this.id = new Date().getTime();
        if (provider) {
            this.provider = provider;
        }
        this.pDie = serverData.pDie || 0;
        this.replicationNumber = serverData.replicationNumber || 0;
        this.failedCounter = 0;
    }
    Server.prototype.close = function () {
        this.provider.destroy();
    };
    Server.prototype.hasFailed = function () {
        var failed = false;
        if (this.pDie) {
            var replicationsCounter = this.replicationNumber + 1;
            do {
                var diff = (this.replicationNumber + 1) - replicationsCounter;
                failed = index_1.random(100) <= (this.pDie / Math.pow(10, diff));
                failed && this.failedCounter++;
                replicationsCounter--;
            } while (failed && replicationsCounter);
        }
        return failed;
    };
    return Server;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Server;
