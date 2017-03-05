import Client from "./Client";
import Server from "./Server";
import RabbitMQ from "../services/RabbitMQ";
import ExpectantClient from "./clients/Expectant";
export class Life {

    servers: Array<Server> = [];
    clients: Array<Client> = [];

    live(data) {
        console.log(data);

        const { nClients, nServers } = data;

        const { servers, clients } = this;

        for (let i = 0; i < nServers; i++) {
            const server = new Server(new RabbitMQ())
            server.listen();

            servers.push(server);
        }

        for (let i = 0; i < nClients; i++) {
            const client = new ExpectantClient();
            client.requestServer();

            clients.push(client);
        }
    };

    clear() {
        const { servers } = this;
        if (servers.length) {
            servers.forEach(s => s.close());

            this.servers = [];
            this.clients = [];
        }
    }
}