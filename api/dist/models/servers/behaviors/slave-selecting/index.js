"use strict";
var index_1 = require("../../../../helpers/index");
var RandomSlaveSelecting = (function () {
    function RandomSlaveSelecting() {
    }
    Object.defineProperty(RandomSlaveSelecting, "instance", {
        get: function () {
            if (!this._instance) {
                this._instance = new RandomSlaveSelecting();
            }
            return this._instance;
        },
        enumerable: true,
        configurable: true
    });
    RandomSlaveSelecting.prototype.getSlaveServerId = function (slavesIds) {
        return slavesIds[index_1.random(slavesIds.length - 1)];
    };
    return RandomSlaveSelecting;
}());
exports.RandomSlaveSelecting = RandomSlaveSelecting;
var TestSlaveSelecting = (function () {
    function TestSlaveSelecting() {
    }
    Object.defineProperty(TestSlaveSelecting, "instance", {
        get: function () {
            if (!this._instance) {
                this._instance = new RandomSlaveSelecting();
            }
            return this._instance;
        },
        enumerable: true,
        configurable: true
    });
    TestSlaveSelecting.prototype.getSlaveServerId = function (slavesIds) {
        return slavesIds[index_1.random(slavesIds.length - 1)];
    };
    return TestSlaveSelecting;
}());
exports.TestSlaveSelecting = TestSlaveSelecting;
