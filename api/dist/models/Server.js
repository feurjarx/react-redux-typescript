"use strict";
var Observable_1 = require("rxjs/Observable");
var rabbitmq_1 = require("./../configs/rabbitmq");
var Server = (function () {
    function Server(provider) {
        this.requestCounter = 0;
        this.subscriptions = [];
        this.id = new Date().getTime();
        this.provider = provider;
    }
    Server.prototype.listen = function (callback) {
        var _this = this;
        if (callback === void 0) { callback = null; }
        var observable = new Observable_1.Observable(function (observer) {
            var queueName = rabbitmq_1.default.queueName;
            _this.provider
                .consume(queueName)
                .subscribe(function (response) {
                response = JSON.parse(response.content.toString());
                console.log("Server #" + _this.id + " received " + JSON.stringify(response, null, 2));
                var requestTimeLimit = response.requestTimeLimit;
                if (_this.calculateBehavior) {
                    _this.calculateBehavior
                        .calculate(requestTimeLimit)
                        .then(function () {
                        _this.requestCounter++;
                        observer.next(response);
                    });
                }
                else {
                    _this.requestCounter++;
                    observer.next(response);
                }
            });
        });
        var subscription;
        if (callback instanceof Function) {
            callback = callback.bind(this);
            subscription = observable.subscribe(callback);
        }
        else {
            subscription = observable.subscribe();
        }
        this.subscriptions.push(subscription);
    };
    Server.prototype.close = function () {
        this.provider.destroy();
        this.subscriptions.forEach(function (s) { return s.unsubscribe(); });
        this.subscriptions = [];
    };
    return Server;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Server;
