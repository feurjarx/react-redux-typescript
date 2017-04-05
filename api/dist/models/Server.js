"use strict";
var Observable_1 = require("rxjs/Observable");
var rabbitmq_1 = require("./../configs/rabbitmq");
var Server = (function () {
    function Server(provider) {
        if (provider === void 0) { provider = null; }
        this.requestCounter = 0;
        this.processingTimeCounter = 0;
        this.lastProcessingTime = 0;
        this.subscriptions = [];
        this.id = new Date().getTime();
        if (provider) {
            this.provider = provider;
        }
    }
    Server.prototype.listen = function (callback) {
        var _this = this;
        if (callback === void 0) { callback = null; }
        var observable = new Observable_1.Observable(function (observer) {
            var queueName = rabbitmq_1.default.queueName;
            var lazy = true;
            _this.provider
                .consume(queueName, { lazy: lazy })
                .subscribe(function (response) {
                var body = JSON.parse(response.content.toString());
                console.log("Server #" + _this.id + " received " + response);
                var requestTimeLimit = body.requestTimeLimit;
                if (_this.calculateBehavior) {
                    _this.calculateBehavior
                        .calculate(requestTimeLimit)
                        .then(function (_a) {
                        var duration = _a.duration;
                        _this.requestCounter++;
                        _this.processingTimeCounter += duration;
                        _this.lastProcessingTime = duration;
                        if (lazy) {
                            _this.provider.acknowledge(response);
                        }
                        observer.next(body);
                    });
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
