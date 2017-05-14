"use strict";
var GlobalCounter = (function () {
    function GlobalCounter() {
    }
    GlobalCounter.init = function (countId) {
        this.map.set(countId, 0);
    };
    GlobalCounter.reset = function () {
        this.map.clear();
    };
    GlobalCounter.up = function (countId) {
        var count = this.map.get(countId);
        this.map.set(countId, count + 1);
        console.log(false, "*** GLOBAL COUNTER: " + String(countId).toUpperCase() + " = " + (count + 1) + " ***");
    };
    return GlobalCounter;
}());
GlobalCounter.map = new Map();
exports.GlobalCounter = GlobalCounter;
