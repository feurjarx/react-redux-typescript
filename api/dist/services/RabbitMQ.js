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
var md5 = require('md5');
var RabbitMQ = (function () {
    function RabbitMQ() {
    }
    RabbitMQ.prototype.openConnection = function () {
        var _this = this;
        if (this.connection) {
            this.destroy();
        }
        var amqpUrl = rabbitmq_1.default.amqpUrl;
        return new es6_shim_1.Promise(function (resolve, reject) {
            amqp.connect(amqpUrl, function (err, conn) {
                if (err) {
                    reject(err);
                }
                else {
                    _this.connection = conn;
                    resolve(conn);
                }
            });
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
    RabbitMQ.prototype.publishAndWaitSender = function (queueName, tempQueueName, data) {
        var correlationId = data.correlationId;
        this.channel.sendToQueue(queueName, new Buffer(JSON.stringify(data)), {
            correlationId: correlationId,
            replyTo: tempQueueName
        });
    };
    /**
     * Warning! Need call destroy after use
     */
    RabbitMQ.prototype.publishAndWait = function (queueName, data) {
        var _this = this;
        if (data === void 0) { data = {}; }
        return new Observable_1.Observable(function (observer) {
            _this.connect()
                .then(function (ch) {
                var exclusive = true;
                var noAck = true;
                ch.assertQueue('', { exclusive: exclusive }, function (err, queueTemp) {
                    if (err) {
                    }
                    else {
                        var correlationId_1 = md5(Date.now());
                        var sendCall_1 = _this.publishAndWaitSender.bind(_this, queueName, queueTemp.queue);
                        ch.consume(queueTemp.queue, function (response) {
                            if (response.properties.correlationId === correlationId_1) {
                                observer.next({
                                    type: 'received',
                                    data: response,
                                    repeat: function (newData) {
                                        sendCall_1(__assign({ correlationId: correlationId_1 }, newData));
                                        observer.next({
                                            type: 'sent'
                                        });
                                    }
                                });
                            }
                        });
                        sendCall_1(__assign({ correlationId: correlationId_1 }, data));
                        observer.next({
                            type: 'sent'
                        });
                    }
                }, { noAck: noAck });
            });
        });
    };
    RabbitMQ.prototype.publish = function (queueName, data) {
        var _this = this;
        if (data === void 0) { data = {}; }
        return new es6_shim_1.Promise(function (resolve, reject) {
            // this.openConnection()
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
    RabbitMQ.prototype.acknowledge = function (msg) {
        this.channel.ack(msg);
    };
    RabbitMQ.prototype.consume = function (queueName, _a) {
        var _this = this;
        var _b = _a.lazy, lazy = _b === void 0 ? false : _b;
        return new Observable_1.Observable(function (observer) {
            _this.connect()
                .then(function (ch) {
                var durable = false;
                ch.assertQueue(queueName, { durable: durable });
                var noAck = true;
                if (lazy) {
                    noAck = false;
                    ch.prefetch(1);
                }
                ch.consume(queueName, function (msg) {
                    var _a = msg.properties, replyTo = _a.replyTo, correlationId = _a.correlationId;
                    if (correlationId && replyTo) {
                        ch.sendToQueue(replyTo, new Buffer('ok'), {
                            correlationId: correlationId
                        });
                    }
                    observer.next(msg);
                }, { noAck: noAck });
            })
                .catch(function (err) {
                throw new Error('Connect invalid');
            });
        });
    };
    RabbitMQ.prototype.destroy = function () {
        return this.connection.close();
    };
    return RabbitMQ;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RabbitMQ;
