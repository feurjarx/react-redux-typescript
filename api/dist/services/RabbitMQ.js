"use strict";
var amqp = require("amqplib/callback_api");
var Observable_1 = require("rxjs/Observable");
var es6_shim_1 = require("es6-shim");
var rabbitmq_1 = require("./../configs/rabbitmq");
var RabbitMQ = (function () {
    function RabbitMQ() {
    }
    RabbitMQ.prototype.openConnection = function () {
        var _this = this;
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
        return new es6_shim_1.Promise(function (resolve, reject) {
            conn.createChannel(function (err, channel) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(channel);
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
    RabbitMQ.prototype.publish = function (queueName, data) {
        var _this = this;
        return new es6_shim_1.Promise(function (resolve, reject) {
            _this.openConnection()
                .then(function (c) { return _this.getChannelFromConnection(c); })
                .then(function (ch) {
                ch.assertQueue(queueName, {
                    durable: false
                });
                setTimeout(function () {
                    ch.sendToQueue(queueName, new Buffer(data));
                    setTimeout(function () { return _this.connection.close(); }, 500);
                    resolve();
                }, 100);
            })
                .catch(function (err) { return reject(err); });
        });
    };
    RabbitMQ.prototype.consume = function (queueName) {
        var _this = this;
        return new Observable_1.Observable(function (observer) {
            _this.connect()
                .then(function (ch) {
                ch.assertQueue(queueName, {
                    durable: false
                });
                ch.consume(queueName, function (msg) { return observer.next(msg); }, {
                    noAck: true
                });
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
