"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Server_1 = require("../Server");
var DataServer = (function (_super) {
    __extends(DataServer, _super);
    function DataServer(provider, serverData) {
        var _this = _super.call(this, provider) || this;
        _this.regions = [];
        var hdd = serverData.hdd, isMaster = serverData.isMaster;
        _this.hdd = hdd;
        _this.isMaster = isMaster;
        return _this;
    }
    ;
    return DataServer;
}(Server_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DataServer;
