"use strict";
var ioServer = require("socket.io");
var http = require("http");
var amqp = require("amqplib/callback_api");
var events_1 = require("./constants/events");
var socketPort = 3003;
function life(data) {
    console.log('client data: ');
    console.log(data);
    amqp.connect('amqp://localhost', function (err, conn) {
        conn.createChannel(function (err, channel) {
            var queueName = 'test';
            channel.assertQueue(queueName, {
                durable: false
            });
            channel.sendToQueue(queueName, new Buffer('Hello world'));
            console.log('i send');
            setTimeout(function () { return conn.close(); }, 500);
        });
    });
    amqp.connect('amqp://localhost', function (err, conn) {
        conn.createChannel(function (err, channel) {
            var queueName = 'test';
            channel.assertQueue(queueName, {
                durable: false
            });
            channel.consume(queueName, function (msg) {
                console.log(" [!] Received %s", msg.content.toString());
            }, { noAck: true });
        });
    });
}
function disconnect() {
    console.log('client was disconnected.');
}
exports.run = function () {
    var httpServer = http.createServer();
    var io = ioServer(httpServer);
    io.on(events_1.EVENT_IO_CONNECTION, function (client) {
        console.log('client connected.');
        client.on(events_1.EVENT_IO_LIFE, life);
        client.on(events_1.EVENT_IO_DISCONNECT, disconnect);
    });
    httpServer.listen(socketPort);
};
exports.run();
