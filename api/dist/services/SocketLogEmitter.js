"use strict";
var SocketLogEmitter = (function () {
    function SocketLogEmitter() {
        this.counter = 0;
        this.batch = [];
        this.batchSize = 10;
        this.consoleLog = console.log;
    }
    Object.defineProperty(SocketLogEmitter, "instance", {
        get: function () {
            if (!this._instance) {
                this._instance = new SocketLogEmitter();
            }
            return this._instance;
        },
        enumerable: true,
        configurable: true
    });
    SocketLogEmitter.prototype.setBatchSize = function (v) {
        this.batchSize = v;
    };
    SocketLogEmitter.prototype.init = function (emmiter, eventName) {
        this.emitter = emmiter;
        this.eventName = eventName;
        return this;
    };
    SocketLogEmitter.prototype.enable = function () {
        var _this = this;
        var _a = this, emitter = _a.emitter, eventName = _a.eventName;
        if (![emitter, eventName].every(function (it) { return it; })) {
            throw new Error('Not inited instance');
        }
        var consoleLog = this.consoleLog;
        console.log = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (args[0] === false) {
                args.shift();
                consoleLog.apply(console, args);
            }
            else {
                consoleLog.apply(console, args);
                _this.batch.push(new Date().toLocaleTimeString() + ": " + args.join(','));
                var counter = _this.counter;
                counter = (counter + 1) % _this.batchSize;
                if (counter === 0) {
                    emitter.emit(eventName, JSON.stringify(_this.batch));
                    _this.batch = [];
                }
                _this.counter = counter;
            }
        };
    };
    SocketLogEmitter.prototype.emitForce = function () {
        var _a = this, emitter = _a.emitter, eventName = _a.eventName, batch = _a.batch;
        emitter.emit(eventName, JSON.stringify(batch));
        this.batch = [];
    };
    SocketLogEmitter.prototype.disable = function () {
        console.log = this.consoleLog;
        this.counter = 0;
        this.batch = [];
    };
    return SocketLogEmitter;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SocketLogEmitter;
