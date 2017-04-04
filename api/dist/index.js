"use strict";
var ioServer = require("socket.io");
var http = require("http");
var events_1 = require("./constants/events");
var socket_io_1 = require("./configs/socket.io");
var QueueSystemLife_1 = require("./models/QueueSystemLife");
exports.run = function () {
    var httpServer = http.createServer();
    var io = ioServer(httpServer);
    io.on(events_1.EVENT_IO_CONNECTION, function (client) {
        console.log('browser client connected.');
        // const life = new Life();
        var life = new QueueSystemLife_1.QueueSystemLife();
        client.on(events_1.EVENT_IO_LIFE, function (data) {
            life.clear();
            life.live(data, function (browserData) {
                if (browserData.type === 'load_line') {
                    client.emit(events_1.EVENT_IO_LOAD_LINE, browserData);
                }
                else {
                    client.emit(events_1.EVENT_IO_LIFE, browserData);
                }
            }, function () { return client.emit(events_1.EVENT_IO_THE_END); });
        });
        client.on(events_1.EVENT_IO_DISCONNECT, function () {
            life.clear();
            console.log('browser client was disconnected.');
        });
    });
    httpServer.listen(socket_io_1.default.port);
};
exports.run();
