"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RabbitMQ_1 = require("../services/RabbitMQ");
var Life_1 = require("./Life");
var MapGenerator_1 = require("./MapGenerator");
var MasterServer_1 = require("./servers/MasterServer");
var HashDistribution_1 = require("./servers/HashDistribution");
var RegionServer_1 = require("./servers/RegionServer");
var QueueSystemLife = (function (_super) {
    __extends(QueueSystemLife, _super);
    function QueueSystemLife() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    QueueSystemLife.prototype.live = function (data, callback, complete) {
        if (callback === void 0) { callback = null; }
        if (complete === void 0) { complete = null; }
        console.log(data);
        var tables = data.tables;
        var serversData = data.servers;
        var masterServer = new MasterServer_1.default(new RabbitMQ_1.default(), serversData.find(function (it) { return it.isMaster; }));
        masterServer.distrubutionBehavior = new HashDistribution_1.default();
        for (var i = 0; i < serversData.length; i++) {
            var serverData = serversData[i];
            if (!serverData.isMaster) {
                var server = new RegionServer_1.default(serverData);
                server.id = serverData.name;
                masterServer.subordinates.push(server);
            }
        }
        MapGenerator_1.default.fillRegions({ tables: tables, totalSize: 1000 }, masterServer);
        this.masterServer = masterServer;
    };
    ;
    return QueueSystemLife;
}(Life_1.Life));
exports.QueueSystemLife = QueueSystemLife;
