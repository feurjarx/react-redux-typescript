import RabbitMQ from "../services/RabbitMQ";
import {Life} from "./Life";
import MapGenerator from "./MapGenerator";
import MasterServer from "./servers/MasterServer";
import HashDistribution from "./servers/HashDistribution";
import RegionServer from "./servers/RegionServer";

export class QueueSystemLife extends Life {

    masterServer: MasterServer;

    live(data, callback = null, complete = null) {
        console.log(data);

        const {tables} = data;
        const serversData = data.servers;

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

        this.masterServer = masterServer;
    };
}