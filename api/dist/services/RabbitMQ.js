"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var amqp = require("amqplib/callback_api");
var Observable_1 = require("rxjs/Observable");
var es6_shim_1 = require("es6-shim");
var rabbitmq_1 = require("./../configs/rabbitmq");
var index_1 = require("../constants/index");
var md5 = require('md5');
var RabbitMQ = (function () {
    function RabbitMQ() {
    }
    RabbitMQ.prototype.openConnection = function () {
        var _this = this;
        var amqpUrl = rabbitmq_1.default.amqpUrl;
        return new es6_shim_1.Promise(function (resolve, reject) {
            if (_this.connection) {
                resolve(_this.connection);
            }
            else {
                amqp.connect(amqpUrl, function (err, conn) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        _this.connection = conn;
                        resolve(conn);
                    }
                });
            }
        });
    };
    RabbitMQ.prototype.getChannelFromConnection = function (conn) {
        var _this = this;
        return new es6_shim_1.Promise(function (resolve, reject) {
            conn.createChannel(function (err, ch) {
                if (err) {
                    reject(err);
                }
                else {
                    _this.channel = ch;
                    resolve(ch);
                }
            });
        });
    };
    RabbitMQ.prototype.connect = function () {
        var _this = this;
        return new es6_shim_1.Promise(function (resolve, reject) {
            _this.openConnection()
                .then(function (conn) { return _this.getChannelFromConnection(conn); })
                .then(function (ch) { return resolve(ch); })
                .catch(function (err) { return reject(err); });
        });
    };
    RabbitMQ.prototype.publishAndWait = function (queueName, data) {
        var _this = this;
        if (data === void 0) { data = {}; }
        return new Observable_1.Observable(function (observer) {
            _this.connect()
                .then(function (ch) {
                var exclusive = true;
                ch.assertQueue('', { exclusive: exclusive }, function (err, queueTemp) {
                    var correlationId = md5(Date.now());
                    var sendCall = function (data) {
                        ch.sendToQueue(queueName, new Buffer(JSON.stringify(data)), {
                            correlationId: data.correlationId,
                            replyTo: queueTemp.queue
                        });
                    };
                    ch.consume(queueTemp.queue, function (msg) {
                        if (msg.properties.correlationId === correlationId) {
                            observer.next(__assign({ type: index_1.RESPONSE_TYPE_RECEIVED }, JSON.parse(msg.content.toString()), { repeat: function (newData) {
                                    sendCall(__assign({ correlationId: correlationId }, newData));
                                    observer.next(__assign({ type: index_1.RESPONSE_TYPE_SENT }, data));
                                } }));
                        }
                    }, { noAck: true });
                    sendCall(__assign({ correlationId: correlationId }, data));
                    observer.next(__assign({ type: index_1.RESPONSE_TYPE_SENT }, data));
                });
            });
        });
    };
    RabbitMQ.prototype.publishAndWaitByRouteKeys = function (exchange, routeKeys, data, _a) {
        var _this = this;
        if (data === void 0) { data = {}; }
        var _b = _a.autoclose, autoclose = _b === void 0 ? false : _b;
        return new Observable_1.Observable(function (observer) {
            _this.connect()
                .then(function (ch) {
                var exclusive = true;
                var noAck = true;
                ch.assertQueue('', { exclusive: exclusive }, function (err, queueTemp) {
                    ch.assertExchange(exchange, 'direct', { durable: false });
                    var correlationId = md5(Date.now());
                    ch.consume(queueTemp.queue, function (msg) {
                        if (msg.properties.correlationId === correlationId) {
                            observer.next(__assign({ type: index_1.RESPONSE_TYPE_RECEIVED }, JSON.parse(msg.content.toString())));
                        }
                        if (autoclose) {
                            setTimeout(function () { return _this.destroy(); }, 500);
                        }
                    }, { noAck: noAck });
                    routeKeys.forEach(function (routeKey) {
                        var buffer = new Buffer(JSON.stringify(data));
                        ch.publish(exchange, routeKey, buffer, {
                            correlationId: correlationId,
                            replyTo: queueTemp.queue
                        });
                    });
                    observer.next(__assign({ type: index_1.RESPONSE_TYPE_SENT }, data));
                });
            });
        });
    };
    RabbitMQ.prototype.publish = function (queueName, data) {
        var _this = this;
        if (data === void 0) { data = {}; }
        return new es6_shim_1.Promise(function (resolve, reject) {
            _this.connect()
                .then(function (ch) {
                ch.assertQueue(queueName, {
                    durable: false
                });
                ch.sendToQueue(queueName, new Buffer(JSON.stringify(data)));
                setTimeout(function () { return _this.connection.close(); }, 500);
                resolve();
            })
                .catch(function (err) { return reject(err); });
        });
    };
    RabbitMQ.prototype.consume = function (queueName, _a) {
        var _this = this;
        var _b = _a.lazy, lazy = _b === void 0 ? false : _b;
        return new Observable_1.Observable(function (observer) {
            _this.connect()
                .then(function (ch) {
                var durable = false;
                ch.assertQueue(queueName, { durable: durable });
                if (lazy) {
                    ch.prefetch(1);
                }
                ch.consume(queueName, function (msg) {
                    var response = __assign({}, JSON.parse(msg.content.toString()), { onReply: Function() });
                    var _a = msg.properties, replyTo = _a.replyTo, correlationId = _a.correlationId;
                    if (correlationId && replyTo) {
                        response.onReply = function (replyData) {
                            var buffer = new Buffer(JSON.stringify(replyData));
                            ch.sendToQueue(replyTo, buffer, { correlationId: correlationId });
                        };
                    }
                    observer.next(response);
                }, { noAck: !lazy });
            })
                .catch(function (err) {
                throw new Error('Connect invalid');
            });
        });
    };
    RabbitMQ.prototype.consumeByRouteKeys = function (exchange, routeKeys, _a) {
        var _this = this;
        var _b = _a === void 0 ? {} : _a, _c = _b.resolve, resolve = _c === void 0 ? Function() : _c, _d = _b.lazy, lazy = _d === void 0 ? true : _d;
        return new Observable_1.Observable(function (observer) {
            _this.connect()
                .then(function (ch) {
                var durable = false;
                // const durable = true;
                ch.assertExchange(exchange, 'direct', { durable: durable });
                var exclusive = true;
                ch.assertQueue('', { exclusive: exclusive }, function (err, queueTemp) {
                    routeKeys.forEach(function (routeKey) {
                        ch.bindQueue(queueTemp.queue, exchange, routeKey);
                    });
                    if (lazy) {
                        ch.prefetch(1);
                    }
                    resolve();
                    ch.consume(queueTemp.queue, function (msg) {
                        // from MasterServer (client request redirect)
                        var response = __assign({}, JSON.parse(msg.content.toString()), { onReply: Function() });
                        var _a = msg.properties, replyTo = _a.replyTo, correlationId = _a.correlationId;
                        if (correlationId && replyTo) {
                            response.onReply = function (replyData) {
                                var buffer = new Buffer(JSON.stringify(replyData));
                                ch.sendToQueue(replyTo, buffer, { correlationId: correlationId });
                                if (lazy) {
                                    ch.ack(msg);
                                }
                            };
                        }
                        observer.next(response);
                    }, { noAck: !lazy });
                });
            });
        });
    };
    RabbitMQ.prototype.destroy = function () {
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
    };
    return RabbitMQ;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RabbitMQ;
