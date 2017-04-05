"use strict";
var ioServer = require("socket.io");
var http = require("http");
var events_1 = require("./constants/events");
var socket_io_1 = require("./configs/socket.io");
var Life_1 = require("./models/Life");
var index_1 = require("./helpers/index");
exports.run = function () {
    var httpServer = http.createServer();
    var io = ioServer(httpServer);
    io.on(events_1.EVENT_IO_CONNECTION, function (client) {
        console.log('browser client connected.');
        var life = new Life_1.Life();
        client.on(events_1.EVENT_IO_LIFE, index_1.composition(function (data) {
            life.preLive(data, function (browserData) { return client.emit(events_1.EVENT_IO_PRELIFE, browserData); });
        }, function (data) {
            return;
            life.clear();
            life.live(data, function (browserData) {
                if (browserData.type === 'load_line') {
                    client.emit(events_1.EVENT_IO_LOAD_LINE, browserData);
                }
                else {
                    client.emit(events_1.EVENT_IO_LIFE, browserData);
                }
            }, function () { return client.emit(events_1.EVENT_IO_THE_END); });
        }));
        client.on(events_1.EVENT_IO_DISCONNECT, function () {
            life.clear();
            console.log('browser client was disconnected.');
        });
    });
    httpServer.listen(socket_io_1.default.port);
};
exports.run();
