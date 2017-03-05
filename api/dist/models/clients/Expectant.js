"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Client_1 = require("../Client");
var RabbitMQ_1 = require("../../services/RabbitMQ");
var ExpectantClient = (function (_super) {
    __extends(ExpectantClient, _super);
    function ExpectantClient() {
        return _super.call(this, new RabbitMQ_1.default()) || this;
    }
    ExpectantClient.prototype.accept = function (callback) {
    };
    return ExpectantClient;
}(Client_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ExpectantClient;
