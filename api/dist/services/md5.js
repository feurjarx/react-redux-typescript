"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return md5(args.join(','));
};
