"use strict";
var Observable_1 = require("rxjs/Observable");
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
            var queueName = 'test';
            _this.provider
                .consume(queueName)
                .subscribe(function (msg) {
                console.log("Server #" + _this.id + " received " + msg.content.toString());
                observer.next();
                _this.requestCounter++;
            });
        });
        var subscription;
        if (callback instanceof Function) {
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
