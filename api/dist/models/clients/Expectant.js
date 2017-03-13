"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Client_1 = require("../Client");
var rabbitmq_1 = require("../../configs/rabbitmq");
var ExpectantClient = (function (_super) {
    __extends(ExpectantClient, _super);
    function ExpectantClient(provider) {
        if (provider === void 0) { provider = null; }
        return _super.call(this, provider) || this;
    }
    ExpectantClient.prototype.requestToServer = function (requestsNumber) {
        var _this = this;
        if (requestsNumber === void 0) { requestsNumber = this.requestsNumber; }
        var queueName = rabbitmq_1.default.queueName;
        var requestTimeLimit = this.requestTimeLimit;
        var observable = this.provider
            .publishAndWait(queueName, {
            clientId: this.id,
            last: this.requestsNumber <= 1,
            requestTimeLimit: requestTimeLimit
        });
        this.subscription = observable
            .subscribe(function (response) {
            switch (response.type) {
                case 'sent':
                    console.log("Client #" + _this.id + " request done.");
                    break;
                case 'received':
                    console.log("Client #" + _this.id + " received response from server.");
                    requestsNumber--;
                    if (requestsNumber > 0) {
                        response.repeat({
                            clientId: _this.id,
                            last: requestsNumber <= 1
                        });
                    }
                    else {
                        _this.stop();
                    }
                    break;
                //...
                default:
                    throw new Error("Unexpected response type from server. Type: " + response.type);
            }
        });
        return observable;
    };
    ExpectantClient.prototype.stop = function () {
        this.provider.destroy();
        this.subscription.unsubscribe();
    };
    return ExpectantClient;
}(Client_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ExpectantClient;
