"use strict";
var Observable_1 = require("rxjs/Observable");
var Server = (function () {
    function Server(provider) {
        if (provider === void 0) { provider = null; }
        this.requestCounter = 0;
        this.lastProcessingTime = 0;
        this.subscriptions = [];
        this.id = new Date().getTime();
        if (provider) {
            this.provider = provider;
        }
    }
    /**
     * @deprecated
     */
    Server.prototype.listen = function (queueName, callback, lazy) {
        var _this = this;
        if (callback === void 0) { callback = Function(); }
        if (lazy === void 0) { lazy = true; }
        var observable = new Observable_1.Observable(function (observer) {
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
                        _this.lastProcessingTime = duration;
                        if (lazy) {
                            _this.provider.acknowledge(response);
                        }
                        observer.next(body);
                    });
                }
            });
        });
        var subscription = observable.subscribe(callback.bind(this));
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
