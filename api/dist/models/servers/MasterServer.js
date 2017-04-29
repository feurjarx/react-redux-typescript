"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var Server_1 = require("../Server");
var SlaveServer_1 = require("./SlaveServer");
var HRow_1 = require("../HRow");
var rabbitmq_1 = require("./../../constants/rabbitmq");
var index_1 = require("../../helpers/index");
var sharding_1 = require("./behaviors/sharding");
var constants_1 = require("./../../constants");
var SqlSyntaxService_1 = require("../../services/SqlSyntaxService");
var RabbitMQ_1 = require("../../services/RabbitMQ");
var index_2 = require("./behaviors/calculate/index");
var MasterServer = (function (_super) {
    __extends(MasterServer, _super);
    function MasterServer(provider) {
        var _this = _super.call(this, provider) || this;
        _this.subordinates = [];
        _this.vGuideMap = {};
        _this.guideMap = {};
        _this.hShardingFields = [];
        _this.slavesSubscriptionsMap = {};
        return _this;
    }
    MasterServer.make = function (serversData) {
        if (!serversData.length) {
            return null;
        }
        var masterServer = new MasterServer(new RabbitMQ_1.default());
        for (var i = 0; i < serversData.length; i++) {
            var serverData = serversData[i];
            if (!serverData.isMaster) {
                var server = new SlaveServer_1.default(new RabbitMQ_1.default(), serverData);
                server.calculateBehavior = new index_2.RandomSleepCalculating(500);
                server.id = serverData.name;
                masterServer.subordinates.push(server);
            }
        }
        return masterServer;
    };
    ;
    MasterServer.prototype.setShardingType = function (type) {
        switch (type) {
            case constants_1.SHARDING_TYPE_VERTICAL:
                this.shardingBehavior = sharding_1.VerticalSharding.instance;
                break;
            case constants_1.SHARDING_TYPE_HORIZONTAL:
                this.shardingBehavior = sharding_1.HorizontalSharding.instance;
                break;
            default:
                this.shardingBehavior = sharding_1.HorizontalSharding.instance;
        }
    };
    MasterServer.prototype.getSlaveById = function (id) {
        return this.subordinates.find(function (slave) { return slave.id === id; });
    };
    MasterServer.prototype.updateGuideMaps = function (hRow, slaveId, _a) {
        var _this = this;
        var _b = _a.serverId, serverId = _b === void 0 ? null : _b, _c = _a.fieldName, fieldName = _c === void 0 ? null : _c;
        if (serverId) {
            // v-sharding
            this.vGuideMap[hRow.tableName] = serverId;
        }
        else {
            // h-sharding
            hRow.getArrowKeys().forEach(function (arrowKey) {
                _this.guideMap[arrowKey] = slaveId;
            });
            var tableFieldPath = hRow.tableName + '.' + fieldName;
            if (fieldName && this.hShardingFields.indexOf(tableFieldPath) < 0) {
                this.hShardingFields.push(tableFieldPath);
            }
        }
    };
    MasterServer.prototype.save = function (hRow, shardingOptions) {
        if (shardingOptions === void 0) { shardingOptions = {}; }
        var _a = this.shardingBehavior, repeated = _a.repeated, getSlaveServerId = _a.getSlaveServerId;
        var completed;
        var slaveId;
        var attemptCounter = 0;
        var safeLimit = Math.pow(this.getSlavesNumber(), 2);
        var slavesIds = this.getSlavesIds();
        do {
            slaveId = getSlaveServerId(hRow, slavesIds, __assign({}, shardingOptions, { attemptCounter: attemptCounter }));
            completed = this
                .getSlaveById(slaveId)
                .save(hRow);
        } while (repeated && !completed && ++attemptCounter < safeLimit);
        if (!completed) {
            throw new Error("\u0417\u0430\u043F\u0438\u0441\u044C \u0440\u0430\u0437\u043C\u0435\u0440\u043E\u043C " + hRow.getSize() + " \u043D\u0435 \u0431\u044B\u043B\u0430 \u0437\u0430\u043F\u0438\u0441\u0430\u043D\u0430 (\u0420\u0435\u0433\u0438\u043E\u043D \u0441\u0435\u0440\u0432\u0435\u0440 " + slaveId + ", " + this.shardingBehavior.type + ")");
        }
        this.updateGuideMaps(hRow, slaveId, shardingOptions);
        console.log(false, "\u0412\u044B\u0431\u0440\u0430\u043D slave #" + slaveId);
    };
    MasterServer.prototype.getSlavesNumber = function () {
        return this.subordinates.length;
    };
    MasterServer.prototype.getSlavesIds = function () {
        return this.subordinates.map(function (s) { return s.id; });
    };
    MasterServer.prototype.prepare = function () {
        this.listen(rabbitmq_1.RABBITMQ_QUEUE_MASTER_SERVER);
        var promises = [];
        this.subordinates.forEach(function (slave) {
            promises.push(slave.listenExchange(rabbitmq_1.RABBITMQ_EXCHANGE_SLAVE_SERVERS));
        });
        return Promise.all(promises);
    };
    MasterServer.prototype.getSlavesIdsBySql = function (sqlQueryParts) {
        var _this = this;
        var result = [];
        var tableName = sqlQueryParts.from[0];
        // check v-sharding
        if (this.vGuideMap[tableName]) {
            result.push(this.vGuideMap[tableName]);
        }
        else {
            SqlSyntaxService_1.default.instance
                .getAndsListFromWhere(sqlQueryParts.where)
                .forEach(function (ands) {
                var slavesIds = [];
                var primaryFieldName = null;
                for (var i = 0; i < ands.length; i++) {
                    var criteria = ands[i];
                    var operator = criteria.operator, table = criteria.table, field = criteria.field, value = criteria.value;
                    if (operator !== constants_1.SQL_OPERATOR_EQ) {
                        slavesIds = [];
                        break;
                    }
                    var tableFieldPath = table + '.' + field;
                    // for '='
                    if (primaryFieldName === tableFieldPath) {
                        slavesIds = [];
                        // for, example "... WHERE user.id = 1 and user.id = 2"
                        break;
                    }
                    if (_this.hShardingFields.indexOf(tableFieldPath) >= 0) {
                        var slaveIdx = value % _this.getSlavesNumber();
                        slavesIds.push(_this.subordinates[slaveIdx].id);
                    }
                    else {
                        var guideKey = HRow_1.default.calcArrowKey(criteria);
                        var slaveId = _this.guideMap[guideKey];
                        if (!slaveId) {
                            slavesIds = [];
                            break;
                        }
                        slavesIds.push(slaveId);
                        if (criteria.isPrimaryField) {
                            primaryFieldName = criteria.table + '.' + criteria.field;
                        }
                    }
                }
                result.push.apply(result, slavesIds);
            });
        }
        return index_1.unique(result);
    };
    MasterServer.prototype.listen = function (queueName, lazy) {
        var _this = this;
        if (lazy === void 0) { lazy = false; }
        console.log('Мастер-сервер ожидает запросы...');
        this.clientsSubscription = this.provider
            .consume(queueName, { lazy: lazy })
            .subscribe(function (clientRequest) {
            // clientRequest.onReply({error: 404});
            var processingTimeCounter = 0;
            var clientId = clientRequest.clientId, sqlQueryParts = clientRequest.sqlQueryParts;
            var onClientReply = clientRequest.onReply;
            console.log("\u041C\u0430\u0441\u0442\u0435\u0440-\u0441\u0435\u0440\u0432\u0435\u0440 \u043F\u043E\u043B\u0443\u0447\u0438\u043B \u0437\u0430\u043F\u0440\u043E\u0441 \u043E\u0442 \u043A\u043B\u0438\u0435\u043D\u0442\u0430 #" + clientId + ": " + sqlQueryParts.raw);
            if (sqlQueryParts.select) {
                // для простых случае с оператором "=" по словарям
                var slavesIds = _this.getSlavesIdsBySql(sqlQueryParts);
                if (!slavesIds.length) {
                    slavesIds = _this.getSlavesIds();
                }
                var promises_1 = [];
                slavesIds.forEach(function (slaveId) {
                    var slave = _this.getSlaveById(slaveId);
                    console.log("\u041C\u0430\u0441\u0442\u0435\u0440-\u0441\u0435\u0440\u0432\u0435\u0440 \u043F\u0435\u0440\u0435\u043D\u0430\u043F\u0440\u0430\u0432\u043B\u044F\u0435\u0442 \u0437\u0430\u043F\u0440\u043E\u0441 \u043E\u0442 \u043A\u043B\u0438\u0435\u043D\u0442\u0430 #" + clientId + " \u043D\u0430 \u0440\u0435\u0433\u0438\u043E\u043D-\u0441\u0435\u0440\u0432\u0435\u0440 #" + slaveId);
                    promises_1.push(_this.redirectToSlaveServer(slave, { clientId: clientId, sqlQueryParts: sqlQueryParts }, new RabbitMQ_1.default()));
                    processingTimeCounter += slave.calcTransferTime();
                });
                if (promises_1.length) {
                    Promise.all(promises_1).then(function (responses) {
                        var processingTimeAvg = Math.round(responses.reduce(function (sum, it) { return sum + it.processingTime; }, 0) / responses.length);
                        var slavesNames = responses.map(function (it) { return it.slaveId; });
                        var slavesRequestsDiagramData = responses.map(function (it) { return ({
                            requestsCounter: it.requestsCounter,
                            slaveId: it.slaveId
                        }); });
                        var slavesProcessingTimeList = responses.map(function (it) { return it.processingTime; });
                        onClientReply({
                            type: constants_1.RESPONSE_TYPE_RECEIVED,
                            slavesRequestsDiagramData: slavesRequestsDiagramData,
                            slavesProcessingTimeList: slavesProcessingTimeList,
                            slavesNames: slavesNames,
                            processingTime: processingTimeCounter + processingTimeAvg // среднее, потому что slave ищут параллельно
                        });
                    });
                }
                else {
                    onClientReply({ error: 404 });
                }
            }
            else {
            }
        });
    };
    MasterServer.prototype.redirectToSlaveServer = function (slave, data, tempProvider) {
        var _this = this;
        if (tempProvider === void 0) { tempProvider = null; }
        var provider;
        var autoclose;
        if (tempProvider) {
            provider = tempProvider;
            autoclose = true;
        }
        else {
            provider = this.provider;
            autoclose = false;
        }
        return new Promise(function (resolve, reject) {
            var routeKey = slave.id;
            var subKey = index_1.hash(routeKey, Date.now());
            _this.slavesSubscriptionsMap[subKey] = provider
                .publishAndWaitByRouteKeys(rabbitmq_1.RABBITMQ_EXCHANGE_SLAVE_SERVERS, [routeKey], __assign({}, data, { subKey: subKey }), { autoclose: autoclose })
                .subscribe(function (response) {
                // from SlaveServer
                switch (response.type) {
                    case constants_1.RESPONSE_TYPE_SENT:
                        break;
                    case constants_1.RESPONSE_TYPE_RECEIVED:
                        var slaveId = response.slaveId, clientId = response.clientId, subKey_1 = response.subKey;
                        console.log("\u041C\u0430\u0441\u0442\u0435\u0440-\u0441\u0435\u0440\u0432\u0435\u0440 \u043F\u043E\u043B\u0443\u0447\u0438\u043B \u043E\u0442\u0432\u0435\u0442 \u0441 \u0440\u0435\u0433\u0438\u043E\u043D-\u0441\u0435\u0440\u0432\u0435\u0440\u0430 #" + slaveId + " \u043D\u0430 \u0437\u0430\u043F\u0440\u043E\u0441 \u043E\u0442 \u043A\u043B\u0438\u0435\u043D\u0442\u0430 #" + clientId);
                        resolve(response);
                        _this.slavesSubscriptionsMap[subKey_1].unsubscribe();
                        break;
                    default:
                        throw new Error("Unexpected response type from server. Type: " + response.type);
                }
            });
        });
    };
    MasterServer.prototype.close = function () {
        _super.prototype.close.call(this);
        console.log("\u041C\u0430\u0441\u0442\u0435\u0440 #" + this.id + " \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D.");
        this.subordinates.forEach(function (s) { return s.close(); });
        console.log("\u0420\u0435\u0433\u0438\u043E\u043D-\u0441\u0435\u0440\u0432\u0435\u0440\u0430 \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D\u044B.");
        this.clientsSubscription.unsubscribe();
    };
    return MasterServer;
}(Server_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MasterServer;
