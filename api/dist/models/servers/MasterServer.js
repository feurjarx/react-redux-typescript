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
var HRow_1 = require("../HRow");
var rabbitmq_1 = require("./../../constants/rabbitmq");
var index_1 = require("../../helpers/index");
var sharding_1 = require("./behaviors/sharding");
var constants_1 = require("./../../constants");
var MasterServer = (function (_super) {
    __extends(MasterServer, _super);
    function MasterServer(provider, serverData) {
        var _this = _super.call(this, provider) || this;
        _this.vGuideMap = {};
        _this.guideMap = {};
        _this.subscriptionsMap = {};
        var isMaster = serverData.isMaster;
        _this.isMaster = isMaster;
        _this.subordinates = [];
        return _this;
    }
    ;
    MasterServer.prototype.setSharding = function (sharding) {
        if (sharding === void 0) { sharding = {}; }
        var type = sharding.type;
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
    MasterServer.prototype.getSlaveServerById = function (id) {
        return this.subordinates.find(function (slave) { return slave.id === id; });
    };
    MasterServer.prototype.updateGuideMaps = function (hRow, slaveId, _a) {
        var _this = this;
        var _b = _a.serverId, serverId = _b === void 0 ? null : _b;
        if (serverId) {
            // v-sharding
            this.vGuideMap[hRow.tableName] = serverId;
        }
        else {
            // h-sharding
            hRow.getFields().forEach(function (arrow) {
                var guideKey = HRow_1.default.getGuideArrowKey(arrow);
                _this.guideMap[guideKey] = slaveId;
            });
        }
    };
    MasterServer.prototype.save = function (hRow, shardingOptions) {
        if (shardingOptions === void 0) { shardingOptions = {}; }
        var _a = this.shardingBehavior, repeated = _a.repeated, getSlaveServerId = _a.getSlaveServerId;
        var completed;
        var slaveId;
        var attemptCounter = 0;
        var safeLimit = Math.pow(this.getSlaveServersNumber(), 2);
        var slavesIds = this.getSlaveServersIds();
        do {
            slaveId = getSlaveServerId(hRow, slavesIds, __assign({}, shardingOptions, { attemptCounter: attemptCounter }));
            completed = this
                .getSlaveServerById(slaveId)
                .save(hRow);
        } while (repeated && !completed && ++attemptCounter < safeLimit);
        if (!completed) {
            throw new Error("\u0417\u0430\u043F\u0438\u0441\u044C \u0440\u0430\u0437\u043C\u0435\u0440\u043E\u043C " + hRow.getSize() + " \u043D\u0435 \u0431\u044B\u043B\u0430 \u0437\u0430\u043F\u0438\u0441\u0430\u043D\u0430 (\u0420\u0435\u0433\u0438\u043E\u043D \u0441\u0435\u0440\u0432\u0435\u0440 " + slaveId + ", " + this.shardingBehavior.type + ")");
        }
        this.updateGuideMaps(hRow, slaveId, shardingOptions);
        console.log(false, "Select slave server " + slaveId);
    };
    MasterServer.prototype.getSlaveServersNumber = function () {
        return this.subordinates.length;
    };
    MasterServer.prototype.getSlaveServersIds = function () {
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
    MasterServer.prototype.getCriteriaCases = function (where) {
        if (where === void 0) { where = ''; }
        where = where.toLowerCase();
        var ins = [];
        var ors = [];
        var operators = ['=', '<', '>', 'in'];
        where.split('or').forEach(function (orCase) {
            orCase = orCase.trim();
            var ands = [];
            orCase.split('and').forEach(function (andCase) {
                andCase = andCase.trim();
                for (var i = 0; i < operators.length; i++) {
                    var operator = operators[i];
                    var _a = andCase.split(operator).map(function (it) { return it.trim(); }), left = _a[0], value = _a[1];
                    if (value) {
                        if (operator === 'in') {
                            ins.push(andCase);
                            continue;
                        }
                        var _b = left.split('.'), table = _b[0], field = _b[1];
                        value = index_1.qtrim(value);
                        ands.push({
                            table: table,
                            field: field,
                            operator: operator,
                            value: value,
                            isPrimaryField: field === 'id'
                        });
                        break;
                    }
                }
            });
            if (ands.length) {
                ors.push(ands);
            }
        });
        // operator IN transformation to {'or', '='}
        ins.forEach(function (inItem) {
            var _a = inItem.split('in').map(function (it) { return it.trim(); }), left = _a[0], right = _a[1];
            var _b = left.split('.'), table = _b[0], field = _b[1];
            right = right.slice(1, -1); // remove '(' and ')'
            var inValues = right.split(',');
            inValues.forEach(function (v) {
                ors.push([{
                        table: table,
                        field: field,
                        operator: '=',
                        value: index_1.qtrim(v),
                        isPrimaryField: field === 'id'
                    }]);
            });
        });
        return ors;
    };
    MasterServer.prototype.getSlaveServersIdsBySql = function (sqlParts) {
        var _this = this;
        var result = [];
        var tableName = sqlParts.from[0];
        // check as vertical sharding
        if (this.vGuideMap[tableName]) {
            result.push(this.vGuideMap[tableName]);
        }
        else {
            var criteriaCases = this.getCriteriaCases(sqlParts.where);
            if (criteriaCases.length) {
                criteriaCases.forEach(function (ands) {
                    var slavesIds = [];
                    var primaryFieldName = null;
                    for (var i = 0; i < ands.length; i++) {
                        var criteria = ands[i];
                        if (criteria.operator !== '=') {
                            slavesIds = [];
                            break;
                        }
                        // for '='
                        if (primaryFieldName === criteria.table + '.' + criteria.field) {
                            slavesIds = [];
                            // for, example "... WHERE user.id = 1 and user.id = 2"
                            break;
                        }
                        var guideKey = HRow_1.default.getGuideArrowKey(criteria);
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
                    result.push.apply(result, slavesIds);
                });
            }
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
            // from Clients
            var onClientReply = clientRequest.onClientReply, clientId = clientRequest.clientId, sqlParts = clientRequest.sqlParts;
            console.log("\u041C\u0430\u0441\u0442\u0435\u0440-\u0441\u0435\u0440\u0432\u0435\u0440 \u043F\u043E\u043B\u0443\u0447\u0438\u043B \u0437\u0430\u043F\u0440\u043E\u0441 \u043E\u0442 \u043A\u043B\u0438\u0435\u043D\u0442\u0430 #" + clientId);
            // для простых случае с оператором "="
            var slavesIds = _this.getSlaveServersIdsBySql(sqlParts);
            if (!slavesIds.length) {
                slavesIds = _this.getSlaveServersIds();
            }
            var promises = [];
            slavesIds.forEach(function (slaveId) {
                var slave = _this.getSlaveServerById(slaveId);
                console.log("\u041C\u0430\u0441\u0442\u0435\u0440-\u0441\u0435\u0440\u0432\u0435\u0440 \u043F\u0435\u0440\u0435\u043D\u0430\u043F\u0440\u0430\u0432\u043B\u044F\u0435\u0442 \u0437\u0430\u043F\u0440\u043E\u0441 \u043E\u0442 \u043A\u043B\u0438\u0435\u043D\u0442\u0430 #" + clientId + " \u043D\u0430 \u0440\u0435\u0433\u0438\u043E\u043D-\u0441\u0435\u0440\u0432\u0435\u0440 #" + slaveId);
                promises.push(_this.redirectToSlaveServer(slave, { clientId: clientId, sqlParts: sqlParts }));
            });
            if (promises.length) {
                Promise.all(promises).then(function (responses) {
                    var lastProcessingTime = responses.reduce(function (sum, it) { return sum + it.lastProcessingTime; }, 0) / responses.length;
                    var slavesNames = responses.map(function (it) { return it.slaveId; });
                    var slaves = responses.map(function (it) { return ({
                        requestCounter: it.requestCounter,
                        slaveId: it.slaveId
                    }); });
                    onClientReply({
                        type: 'received',
                        slaves: slaves,
                        slavesNames: slavesNames,
                        lastProcessingTime: Math.round(lastProcessingTime)
                    });
                });
            }
            else {
                onClientReply([{ error: 404 }]);
            }
        });
    };
    MasterServer.prototype.redirectToSlaveServer = function (slave, data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var routeKey = slave.id;
            var subKey = index_1.hash(routeKey, Date.now());
            _this.subscriptionsMap[subKey] = _this.provider
                .publishAndWaitByRouteKeys(rabbitmq_1.RABBITMQ_EXCHANGE_SLAVE_SERVERS, [routeKey], __assign({}, data, { subKey: subKey }))
                .subscribe(function (response) {
                // from SlaveServer
                switch (response.type) {
                    case 'sent':
                        break;
                    case 'received':
                        var slaveId = response.slaveId, clientId = response.clientId, subKey_1 = response.subKey;
                        console.log("\u041C\u0430\u0441\u0442\u0435\u0440-\u0441\u0435\u0440\u0432\u0435\u0440 \u043F\u043E\u043B\u0443\u0447\u0438\u043B \u043E\u0442\u0432\u0435\u0442 \u0441 \u0440\u0435\u0433\u0438\u043E\u043D-\u0441\u0435\u0440\u0432\u0435\u0440\u0430 " + slaveId + " \u043D\u0430 \u0437\u0430\u043F\u0440\u043E\u0441 \u043E\u0442 \u043A\u043B\u0438\u0435\u043D\u0442\u0430 #" + clientId);
                        resolve(response);
                        _this.subscriptionsMap[subKey_1].unsubscribe();
                        break;
                    default:
                        throw new Error("Unexpected response type from server. Type: " + response.type);
                }
            });
        });
    };
    MasterServer.prototype.close = function () {
        _super.prototype.close.call(this);
        this.subordinates.forEach(function (s) { return s.close(); });
        this.clientsSubscription.unsubscribe();
    };
    return MasterServer;
}(Server_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MasterServer;
