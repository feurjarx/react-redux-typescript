import MapGenerator from './models/MapGenerator';
import {TableData, ServerData} from "../typings/index";
import RabbitMQ from "./services/RabbitMQ";
import RegionServer from "./models/servers/RegionServer";
import MasterServer from "./models/servers/MasterServer";
import HashDistribution from "./models/servers/HashDistribution";

const tables = [{
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
}] as Array<TableData>;

const serversData = [{
    name: 'server_A',
    hdd: 51000, // bytes
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
    // tables: ['user', 'playlist', 'session']
}] as Array<ServerData>;
// add region

const masterServer = new MasterServer(
    new RabbitMQ(),
    serversData.find(it => it.isMaster)
);

masterServer.distrubutionBehavior = new HashDistribution();

for (let i = 0; i < serversData.length; i++) {
    const serverData = serversData[i];
    if (!serverData.isMaster) {
        const server = new RegionServer(serverData);
        server.id = serverData.name;
        masterServer.subordinates.push(server);
    }
}

MapGenerator.fillRegions({tables, totalSize: 1000}, masterServer);