"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Server_1 = require("../Server");
var MasterServer = (function (_super) {
    __extends(MasterServer, _super);
    function MasterServer(provider, serverData) {
        var _this = _super.call(this, provider) || this;
        var isMaster = serverData.isMaster;
        _this.isMaster = isMaster;
        _this.subordinates = [];
        return _this;
    }
    ;
    MasterServer.prototype.save = function (hRow) {
        var getRegionServerNo = this.distrubutionBehavior.getRegionServerNo;
        var serverRegionNo = getRegionServerNo(hRow, this.subordinates.length);
        console.log('Region no' + serverRegionNo);
        this.subordinates[serverRegionNo].save(hRow);
    };
    return MasterServer;
}(Server_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MasterServer;
