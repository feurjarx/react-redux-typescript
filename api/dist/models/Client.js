"use strict";
var rabbitmq_1 = require("../configs/rabbitmq");
var Client = (function () {
    function Client(provider) {
        if (provider === void 0) { provider = null; }
        /**
         * @deprecated
         */
        this.requestTimeLimit = null;
        this.id = new Date().getTime() % 10000;
        this.provider = provider;
    }
    Client.prototype.setProvider = function (provider) {
        this.provider = provider;
    };
    Client.prototype.requestToServer = function (_a) {
        var _this = this;
        var _b = _a.message, message = _b === void 0 ? 'Hello world' : _b;
        var queueName = rabbitmq_1.default.queueName;
        this.provider
            .publish(queueName, {
            message: message,
            clientId: this.id,
            last: true
        })
            .then(function () {
            console.log("Client #" + _this.id + " request done.");
        });
    };
    return Client;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Client;
