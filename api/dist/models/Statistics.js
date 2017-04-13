"use strict";
var Statistics = (function () {
    function Statistics(_a) {
        var nServers = _a.nServers, nClients = _a.nClients;
        this.timersIdsMap = {};
        this.slavesLastProcessingTimeList = [];
        this.unsuccessfulRequestsCounter = 0;
        this.completedClientsCounter = 0;
        this.totalProcessingTime = 0;
        this.requestsCounter = 0;
        this.nServers = nServers;
        this.nClients = nClients;
        this.slavesLastProcessingTimeList = [];
        for (var i = 0; i < nServers - 1; i++) {
            this.slavesLastProcessingTimeList[i] = 0;
        }
    }
    Statistics.prototype.setLastProcessingTime = function (idx, v) {
        this.slavesLastProcessingTimeList[idx] = v;
    };
    Statistics.prototype.upUnsuccessufulRequests = function () {
        this.unsuccessfulRequestsCounter++;
    };
    Statistics.prototype.upCompletedClients = function () {
        this.completedClientsCounter++;
    };
    Statistics.prototype.upRequests = function () {
        this.requestsCounter++;
    };
    Statistics.prototype.isEqualCompletedClients = function () {
        return this.completedClientsCounter >= this.nClients;
    };
    Statistics.prototype.subscribeToProp = function (propName, callback, interval) {
        var _this = this;
        if (callback === void 0) { callback = Function(); }
        if (interval === void 0) { interval = 100; }
        var timersIdsMap = this.timersIdsMap;
        var loopFn;
        var time = 0;
        switch (propName) {
            case Statistics.ABS_BANDWIDTH:
                loopFn = function () {
                    var absBandwidth = _this.totalProcessingTime / _this.nServers / time;
                    callback({
                        type: 'load_line',
                        absBandwidth: absBandwidth
                    });
                };
                break;
            case Statistics.SLAVES_LAST_PROCESSING_TIME_LIST:
                loopFn = function () { return callback(_this.slavesLastProcessingTimeList); };
                break;
            default:
                throw new Error('Unexpected subscription property');
        }
        timersIdsMap[propName] = setInterval(loopFn, interval);
    };
    Statistics.prototype.unsubscribeFromProp = function (propName) {
        clearInterval(this.timersIdsMap[propName]);
    };
    return Statistics;
}());
Statistics.ABS_BANDWIDTH = 'abs_bandwidth';
Statistics.SLAVES_LAST_PROCESSING_TIME_LIST = 'slaves_last_processing_time_list';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Statistics;
