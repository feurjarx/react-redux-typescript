"use strict";
var Statistics = (function () {
    function Statistics(_a) {
        var nServers = _a.nServers;
        this.unsuccessfulRequestsCounter = 0;
        this.completedClientsCounter = 0;
        this.totalProcessingTime = 0;
        this.requestsCounter = 0;
        this.nServers = nServers;
    }
    Statistics.prototype.upUnsuccessufulRequests = function () {
        this.unsuccessfulRequestsCounter++;
    };
    Statistics.prototype.upCompletedClients = function () {
        this.completedClientsCounter++;
    };
    Statistics.prototype.upRequests = function () {
        this.requestsCounter++;
    };
    Statistics.prototype.isEqualCompletedClients = function (n) {
        return this.completedClientsCounter === +n;
    };
    Statistics.prototype.subscribeToAbsBandwidth = function (callback, interval) {
        var _this = this;
        if (callback === void 0) { callback = Function(); }
        if (interval === void 0) { interval = 300; }
        var nServers = this.nServers;
        var time = 0;
        this.absBandwidthTimerId = setInterval(function () {
            time += interval;
            var absBandwidth = _this.totalProcessingTime / nServers / time;
            callback({
                type: 'load_line',
                absBandwidth: absBandwidth
            });
            // console.log(`**** Absolute bandwidth = ${ absBandwidth }`);
        }, interval);
    };
    Statistics.prototype.unsubscribeFromAbsBandwidth = function () {
        if (this.absBandwidthTimerId) {
            clearInterval(this.absBandwidthTimerId);
        }
    };
    return Statistics;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Statistics;
