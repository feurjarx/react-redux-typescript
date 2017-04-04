"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    getNonRepetitiveCombinationsFromArray: function (arr) {
        var length = arr.length;
        var result = [];
        for (var i = 0; i < length; i++) {
            for (var j = i + 1; i <= length; j++) {
                result.push(arr.slice(i, j));
            }
        }
        return result;
    }
};
