import Client from "./Client";
import Server from "./Server";
import RabbitMQ from "../services/RabbitMQ";
import ExpectantClient from "./clients/Expectant";
import RandomSleepCalculating from "./servers/RandomSleepCalculating";

export class Life {

    servers: Array<Server> = [];
    clients: Array<Client> = [];

    live(data, callback = null) {
        console.log(data);

        const { nClients, nServers } = data;

        const { servers, clients } = this;

        for (let i = 0; i < nServers; i++) {
            const server = new Server(new RabbitMQ());

            server.calculateBehavior = new RandomSleepCalculating(5000);
            server.id = i;
            server.listen(function() {
                if (callback instanceof Function) {
                    const {id, requestCounter} = this;
                    console.log({id, requestCounter});

                    callback({
                        id,
                        requestCounter
                    });
                }
            });

            servers.push(server);
        }

        data.clients.forEach(clientData => {

            const client = new ExpectantClient(new RabbitMQ());
            client.setRequestsNumber(clientData['requestsNumber']);
            client.requestServer();

            clients.push(client);
        });
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