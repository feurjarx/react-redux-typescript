"use strict";
var actions_1 = require("../constants/actions");
function updateMonitorItem(data) {
    return {
        type: actions_1.UPDATE_MONITOR_ITEM,
        data: data
    };
}
exports.updateMonitorItem = updateMonitorItem;
function initialLifeData(data) {
    return {
        type: actions_1.INITIAL_LIFE_DATA,
        data: data
    };
}
exports.initialLifeData = initialLifeData;
