"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Life_1 = require("./Life");
var QueueSystemLife = (function (_super) {
    __extends(QueueSystemLife, _super);
    function QueueSystemLife() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    QueueSystemLife.prototype.live = function (data, callback, complete) {
        if (callback === void 0) { callback = null; }
        if (complete === void 0) { complete = null; }
        console.log(data);
        /*const {
            requestTimeLimit,
            nClients,
            servers,
            tables,
            sqls,
        } = data;*/
    };
    ;
    QueueSystemLife.prototype.clear = function () {
        var servers = this.servers;
        if (servers.length) {
            servers.forEach(function (s) { return s.close(); });
        }
        this.servers = [];
        this.clients = [];
    };
    return QueueSystemLife;
}(Life_1.Life));
exports.QueueSystemLife = QueueSystemLife;
