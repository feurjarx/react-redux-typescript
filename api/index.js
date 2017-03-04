"use strict";
var ioServer = require("socket.io");
var http = require("http");
var socketPort = 3003;
exports.run = function () {
    var httpServer = http.createServer();
    var io = ioServer(httpServer);
    io.on('connection', function (client) {
        console.log('client connected.');
        client.on('myevent', function (data) {
            console.log('client data: ');
            console.log(data);
        });
        client.on('disconnect', function () {
            console.log('client was disconnected.');
        });
    });
    httpServer.listen(socketPort);
};
