"use strict";
var rabbitmq_1 = require("../configs/rabbitmq");
var Client = (function () {
    function Client(provider) {
        this.id = new Date().getTime();
        this.provider = provider;
    }
    Client.prototype.requestServer = function (data) {
        var _this = this;
        if (data === void 0) { data = 'Hello world'; }
        var queueName = rabbitmq_1.default.queueName;
        this.provider
            .publish(queueName, data)
            .then(function () {
            console.log("Client #" + _this.id + " request done.");
        });
    };
    return Client;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Client;
