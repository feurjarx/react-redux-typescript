import Client from "./Client";
import Server from "./Server";
import RabbitMQ from "../services/RabbitMQ";
import ExpectantClient from "./clients/Expectant";
import RandomSleepCalculating from "./servers/RandomSleepCalculating";

export class Life {

    servers: Array<Server> = [];
    clients: Array<Client> = [];

    live(data, callback = null, complete = null) {
        console.log(data);

        const { nClients, nServers, requestTimeLimit } = data;

        const { servers, clients } = this;

        let completedClientsCounter = 0;

        for (let i = 0; i < nServers; i++) {
            const server = new Server(new RabbitMQ());

            server.calculateBehavior = new RandomSleepCalculating(5000);
            server.id = i;
            server.listen(function(data) {

                if (callback instanceof Function) {
                    const {id, requestCounter} = this; // server
                    // console.log({id, requestCounter});

                    callback({
                        id,
                        requestCounter
                    });
                }

                if (data.last) {
                    completedClientsCounter++;

                    if (completedClientsCounter === nClients && complete instanceof Function) {
                        complete();
                    }
                }
            });

            servers.push(server);
        }

        data.clients.forEach(clientData => {

            const client = new ExpectantClient(new RabbitMQ());
            client.requestsNumber = +clientData['requestsNumber'];
            client.requestTimeLimit = requestTimeLimit;
            client.requestToServer();

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