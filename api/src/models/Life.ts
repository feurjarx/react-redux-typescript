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

        let timerId;
        let completedClientsCounter = 0;
        let requestsCounter = 0;

        let totalProcessingTimeCounter = 0;

        for (let i = 0; i < nServers; i++) {
            const server = new Server(new RabbitMQ());

            server.calculateBehavior = new RandomSleepCalculating(5000);
            server.id = i;
            server.listen(function(data) {

                if (callback instanceof Function) {
                    const {

                        id,
                        requestCounter,
                        processingTimeCounter,
                        lastProcessingTime

                    } = this as Server; // server

                    console.log({id, requestCounter, processingTimeCounter});

                    callback({
                        id,
                        requestCounter
                    });

                    totalProcessingTimeCounter += lastProcessingTime;
                }

                if (data.last) {
                    completedClientsCounter++;

                    if (completedClientsCounter === nClients) {
                        clearInterval(timerId);
                        if (complete instanceof Function) {
                            complete();
                        }
                    }
                }
            });

            servers.push(server);
        }

        data.clients.forEach(clientData => {

            const client = new ExpectantClient(new RabbitMQ());
            client.requestsNumber = +clientData['requestsNumber'];
            client.requestTimeLimit = requestTimeLimit;
            client
                .requestToServer()
                .subscribe(response => {
                    if (response.type === 'sent') {
                        requestsCounter++;
                    }
                });

            clients.push(client);
        });

        let time = 0;
        const interval = 300;
        timerId = setInterval(() => {

            time += interval;

            // const absThroughput = requestsCounter / nServers / time;
            const absThroughput = totalProcessingTimeCounter / nServers / time;
            callback({
                type: 'load_line',
                absThroughput
            });

            console.log(`**** AbsThroughput = ${ absThroughput }`);

        }, interval);
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