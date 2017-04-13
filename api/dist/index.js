"use strict";
var ioServer = require("socket.io");
var http = require("http");
var events_1 = require("./constants/events");
var socket_io_1 = require("./configs/socket.io");
var Life_1 = require("./models/Life");
var SocketLogEmitter_1 = require("./services/SocketLogEmitter");
exports.run = function () {
    var httpServer = http.createServer();
    var io = ioServer(httpServer);
    var life;
    io.on(events_1.EVENT_IO_CONNECTION, function (client) {
        SocketLogEmitter_1.default.instance
            .init(client, events_1.EVENT_IO_LOGS)
            .enable();
        console.log(false, 'browser client connected.');
        client.on(events_1.EVENT_IO_LIFE, function (data) {
            if (!life || !life.active) {
                if (life) {
                    life.destroy();
                }
                life = new Life_1.Life();
                life
                    .onLifeInfo(function (browserData, type) {
                    client.emit(events_1.EVENT_IO_LIFE, browserData, type);
                })
                    .onLifeComplete(function () {
                    client.emit(events_1.EVENT_IO_THE_END);
                })
                    .onBigDataInfo(function (browserData) { return (client.emit(events_1.EVENT_IO_PRELIFE, browserData)); })
                    .live(data);
            }
        });
        client.on(events_1.EVENT_IO_DISCONNECT, function () {
            console.log('browser client was disconnected.');
        });
    });
    httpServer.listen(socket_io_1.default.port);
};
exports.run();
