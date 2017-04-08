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
    io.on(events_1.EVENT_IO_CONNECTION, function (client) {
        SocketLogEmitter_1.default.instance
            .init(client, events_1.EVENT_IO_LOGS)
            .enable();
        console.log(false, 'browser client connected.');
        var life;
        client.on(events_1.EVENT_IO_LIFE, function (data) {
            if (life) {
                life.destroy();
            }
            life = new Life_1.Life();
            life
                .onLifeInfo(function (browserData) {
                if (browserData.type === 'load_line') {
                    client.emit(events_1.EVENT_IO_LOAD_LINE, browserData);
                }
                else {
                    client.emit(events_1.EVENT_IO_LIFE, browserData);
                }
            })
                .onLifeComplete(function () {
                client.emit(events_1.EVENT_IO_THE_END);
            })
                .onBigDataInfo(function (browserData) { return (client.emit(events_1.EVENT_IO_PRELIFE, browserData)); })
                .live(data);
        });
        client.on(events_1.EVENT_IO_DISCONNECT, function () {
            console.log('browser client was disconnected.');
        });
    });
    httpServer.listen(socket_io_1.default.port);
};
exports.run();
