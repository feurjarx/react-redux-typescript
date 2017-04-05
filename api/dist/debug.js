"use strict";
var MapGenerator_1 = require("./models/MapGenerator");
var RabbitMQ_1 = require("./services/RabbitMQ");
var RegionServer_1 = require("./models/servers/RegionServer");
var MasterServer_1 = require("./models/servers/MasterServer");
var HashDistribution_1 = require("./models/servers/HashDistribution");
var tables = [{
        name: 'user',
        fields: [{
                name: 'id',
                type: 'Числовой',
                isPrimary: true,
            }, {
                name: 'name',
                type: 'Строковый',
                indexed: true,
                familyName: 'permanent'
            }, {
                name: 'email',
                type: 'Строковый',
                indexed: true,
                familyName: 'contacts'
            }, {
                name: 'year',
                type: 'Числовой',
                indexed: true,
                familyName: 'permanent'
            }, {
                name: 'pass',
                type: 'Строковый',
                familyName: '...'
            }, {
                name: 'tel',
                type: 'Строковый',
                familyName: 'contacts'
            }, {
                name: 'created_at',
                type: 'Числовой',
                familyName: 'permanent'
            }]
    }, {
        name: 'session',
        fields: [{
                name: 'id',
                type: 'Числовой',
                isPrimary: true
            }, {
                name: 'created_at',
                type: 'Числовой',
                length: 11,
                indexed: true,
                familyName: 'time'
            }, {
                name: 'status',
                type: 'Строковый',
                indexed: true,
                familyName: '...'
            }]
    }, {
        name: 'playlist',
        fields: [{
                name: 'id',
                type: 'Числовой',
                isPrimary: true
            }, {
                name: 'created_at',
                type: 'Числовой',
                length: 11,
                indexed: true,
                familyName: 'time'
            }, {
                name: 'user_id',
                type: 'Числовой',
                indexed: true,
                familyName: '...'
            }, {
                name: 'description',
                type: 'Строковый',
                familyName: 'music'
            }, {
                name: 'quality',
                type: 'Числовой',
                familyName: 'music'
            }]
    }];
var serversData = [{
        name: 'server_A',
        hdd: 51000,
        // tables: ['user'],
        maxRegions: 5,
        isMaster: true
    }, {
        name: 'server_B',
        maxRegions: 3,
        hdd: 4500
    }, {
        name: 'server_A',
        maxRegions: 10,
        hdd: 12000,
    }];
// add region
var masterServer = new MasterServer_1.default(new RabbitMQ_1.default(), serversData.find(function (it) { return it.isMaster; }));
masterServer.distrubutionBehavior = new HashDistribution_1.default();
for (var i = 0; i < serversData.length; i++) {
    var serverData = serversData[i];
    if (!serverData.isMaster) {
        var server = new RegionServer_1.default(serverData);
        server.id = serverData.name;
        masterServer.subordinates.push(server);
    }
}
MapGenerator_1.default.fillRegions({ tables: tables, totalSize: 1000 }, masterServer);
