"use strict";
var Server = (function () {
    function Server(provider) {
        if (provider === void 0) { provider = null; }
        this.requestCounter = 0;
        this.lastProcessingTime = 0;
        this.id = new Date().getTime();
        if (provider) {
            this.provider = provider;
        }
    }
    Server.prototype.close = function () {
        this.provider.destroy();
    };
    return Server;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Server;
