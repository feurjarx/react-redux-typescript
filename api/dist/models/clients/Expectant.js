"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Client_1 = require("../Client");
var rabbitmq_1 = require("../../constants/rabbitmq");
var index_1 = require("../../helpers/index");
var index_2 = require("../../constants/index");
var ExpectantClient = (function (_super) {
    __extends(ExpectantClient, _super);
    function ExpectantClient(provider, sqls) {
        var _this = _super.call(this, provider) || this;
        _this.sqls = sqls;
        return _this;
    }
    ExpectantClient.prototype.getRandomSqlQueryParts = function () {
        var sqls = this.sqls;
        var idx = index_1.random(sqls.length - 1);
        return sqls[idx];
    };
    ExpectantClient.prototype.requestsToMasterServer = function (nRequests, callback) {
        var _this = this;
        if (nRequests === void 0) { nRequests = 1; }
        if (callback === void 0) { callback = Function(); }
        var requestTimeLimit = this.requestTimeLimit;
        var requestsReverseCounter = nRequests;
        this.subscription = this.provider
            .publishAndWait(rabbitmq_1.RABBITMQ_QUEUE_MASTER_SERVER, {
            clientId: this.id,
            last: requestsReverseCounter <= 1,
            requestTimeLimit: requestTimeLimit,
            sqlQueryParts: this.getRandomSqlQueryParts(),
        })
            .subscribe(function (response) {
            switch (response.type) {
                case index_2.RESPONSE_TYPE_SENT:
                    console.log("\u041A\u043B\u0438\u0435\u043D\u0442 #" + _this.id + " \u0432\u044B\u043F\u043E\u043B\u043D\u0438\u043B \u0437\u0430\u043F\u0440\u043E\u0441: " + response.sqlQueryParts.raw);
                    break;
                case index_2.RESPONSE_TYPE_RECEIVED:
                    if (response.slavesNames) {
                        console.log("\u041A\u043B\u0438\u0435\u043D\u0442 #" + _this.id + " \u043F\u043E\u043B\u0443\u0447\u0438\u043B \u043E\u0442\u0432\u0435\u0442 \u043E\u0442 \u043C\u0430\u0441\u0442\u0435\u0440\u0430. \u041E\u0431\u0440\u0430\u0431\u0430\u0442\u044B\u0432\u0430\u043B\u0438 \u0437\u0430\u043F\u0440\u043E\u0441: " + response.slavesNames.join(','));
                    }
                    else {
                        console.log("\u041A\u043B\u0438\u0435\u043D\u0442 #" + _this.id + " \u043F\u043E\u043B\u0443\u0447\u0438\u043B \u043E\u0442\u0432\u0435\u0442 \u043E\u0442 \u043C\u0430\u0441\u0442\u0435\u0440\u0430. \u041D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E \u043F\u043E\u0434\u0445\u043E\u0434\u044F\u0449\u0435\u0433\u043E \u0440\u0435\u0433\u0438\u043E\u043D-\u0441\u0435\u0440\u0432\u0435\u0440\u0430");
                    }
                    requestsReverseCounter--;
                    if (requestsReverseCounter > 0) {
                        console.log("\u041A\u043B\u0438\u0435\u043D\u0442\u0443 #" + _this.id + " \u043E\u0441\u0442\u0430\u043B\u043E\u0441\u044C " + requestsReverseCounter + " \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u0432. \u0414\u0430\u043B\u0435\u0435, \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0437\u0430\u043F\u0440\u043E\u0441...");
                        response.repeat({
                            clientId: _this.id,
                            last: requestsReverseCounter <= 1,
                            sqlQueryParts: _this.getRandomSqlQueryParts()
                        });
                    }
                    else {
                        response.type = index_2.RESPONSE_TYPE_STOPPED;
                        _this.stop();
                    }
                    break;
                default:
                    throw new Error("Unexpected response type from server. Type: " + response.type);
            }
            callback(response);
        });
    };
    ExpectantClient.prototype.stop = function () {
        this.provider.destroy();
        this.subscription.unsubscribe();
        console.log("\u041A\u043B\u0438\u0435\u043D\u0442 #" + this.id + " \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D.");
    };
    return ExpectantClient;
}(Client_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ExpectantClient;
