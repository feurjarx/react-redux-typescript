import Client from "./Client";
import Server from "./Server";
import RabbitMQ from "../services/RabbitMQ";
import ExpectantClient from "./clients/Expectant";
import RandomSleepCalculating from "./servers/RandomSleepCalculating";
import {Life} from "./Life";
import combinator from '../helpers/combinator';

import MapGenerator from "./MapGenerator";
import MasterServer from "./servers/MasterServer";

export class QueueSystemLife extends Life {

    masterServer: MasterServer;

    live(data, callback = null, complete = null) {
        console.log(data);

        /*const {
            requestTimeLimit,
            nClients,
            servers,
            tables,
            sqls,
        } = data;*/








    };

    clear() {

        const { servers } = this;
        if (servers.length) {
            servers.forEach(s => s.close());
        }

        this.servers = [];
        this.clients = [];
    }
}