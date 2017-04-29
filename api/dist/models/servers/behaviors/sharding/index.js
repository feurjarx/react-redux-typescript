"use strict";
var index_1 = require("../../../../helpers/index");
var VerticalSharding = (function () {
    function VerticalSharding() {
        this.title = 'vertical';
        this.repeated = false;
    }
    Object.defineProperty(VerticalSharding, "instance", {
        get: function () {
            if (!this._instance) {
                this._instance = new VerticalSharding();
            }
            return this._instance;
        },
        enumerable: true,
        configurable: true
    });
    VerticalSharding.prototype.getSlaveServerId = function (hRow, slavesIds, _a) {
        var serverId = _a.serverId;
        return serverId;
    };
    return VerticalSharding;
}());
exports.VerticalSharding = VerticalSharding;
var HorizontalSharding = (function () {
    function HorizontalSharding() {
        this.title = 'horizontal';
        this.repeated = true;
    }
    Object.defineProperty(HorizontalSharding, "instance", {
        get: function () {
            if (!this._instance) {
                this._instance = new HorizontalSharding();
            }
            return this._instance;
        },
        enumerable: true,
        configurable: true
    });
    HorizontalSharding.prototype.getSlaveServerId = function (hRow, slavesIds, _a) {
        var fieldName = _a.fieldName, _b = _a.attemptCounter, attemptCounter = _b === void 0 ? 0 : _b;
        fieldName = fieldName || 'id';
        var value = hRow.getValueByFieldName(fieldName);
        if (typeof value === 'string') {
            value = index_1.str2numbers(value);
        }
        var idx = (value + attemptCounter) % slavesIds.length;
        return slavesIds[idx];
    };
    return HorizontalSharding;
}());
exports.HorizontalSharding = HorizontalSharding;
var RandomSharding = (function () {
    function RandomSharding() {
        this.repeated = true;
    }
    Object.defineProperty(RandomSharding, "instance", {
        get: function () {
            if (!this._instance) {
                this._instance = new RandomSharding();
            }
            return this._instance;
        },
        enumerable: true,
        configurable: true
    });
    RandomSharding.prototype.getSlaveServerId = function (_, slavesIds) {
        return slavesIds[index_1.random(slavesIds.length - 1)];
    };
    return RandomSharding;
}());
exports.RandomSharding = RandomSharding;
