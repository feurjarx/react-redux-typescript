import RabbitMQ from "../services/RabbitMQ";
import ExpectantClient from "./clients/Expectant";
import MasterServer from "./servers/MasterServer";
import RegionServer from "./servers/RegionServer";
import MapGenerator from "./MapGenerator";
import RandomDistribution from "./servers/behaviors/RandomDistribution";
import Statistics from "./Statistics";

export class Life {

    private masterServer: MasterServer;
    private statistics: Statistics;

    private lifeCompleteCallback = Function();
    private lifeInfoCallback = Function();

    private initServers(serversData) {
        const masterServer = new MasterServer(
            new RabbitMQ(),
            serversData.find(it => it.isMaster)
        );

        // masterServer.distrubutionBehavior = new HashDistribution();
        masterServer.distrubutionBehavior = new RandomDistribution();

        for (let i = 0; i < serversData.length; i++) {
            const serverData = serversData[i];
            if (!serverData.isMaster) {
                const server = new RegionServer(new RabbitMQ(), serverData);
                server.id = serverData.name;
                masterServer.subordinates.push(server);
            }
        }

        return masterServer;
    }

    onLifeComplete(callback = Function()) {
        this.lifeCompleteCallback = callback;

        return this;
    };

    onLifeInfo(callback = Function()) {
        this.lifeInfoCallback = callback;

        return this;
    };

    preLive(data, done = Function()) {
        console.log(data);

        const {tables, servers, requiredFilledSize} = data;

        const masterServer = this.initServers(servers);
        const totalSize = requiredFilledSize * 1000;
        MapGenerator.fillRegions({tables, totalSize}, masterServer);

        const regionsServersPies = masterServer.subordinates.map(server => ({
            serverName: server.id,
            chartData: server.calcRegionsSizes()
        }));

        done({regionsServersPies});

        this.masterServer = masterServer;
    };

    live(lifeData) {
        console.log(lifeData);

        const {masterServer} = this;

        const nServers = masterServer.subordinates.length;
        const statistics = new Statistics({nServers});

        const {
            startClientsRequests,
            onMasterServerResponse
        } = this;

        masterServer
            .ready(startClientsRequests.bind(this, lifeData)) // start
            .subscribe(onMasterServerResponse); // final

        statistics.subscribeToAbsBandwidth(absBandwidth => this.lifeInfoCallback({
            type: 'load_line',
            absBandwidth
        }));

        this.statistics = statistics;

        return this;
    };

    startClientsRequests = (lifeData) => {
        const {clients, requestTimeLimit} = lifeData;
        const {statistics} = this;
        const nClients = clients.length;

        clients.forEach(clientData => {
        // [clients[0]].forEach(clientData => {

            const nRequests = +clientData['nRequests'];
            const client = new ExpectantClient(new RabbitMQ());
            client.requestTimeLimit = requestTimeLimit;

            console.log(`Создан новый клиент #${client.id}`);

            client
                .requestsToMasterServer(nRequests, (response) => {
                    switch (response.type) {

                        case 'sent':
                            statistics.upRequests();
                            break;

                        case 'stopped':
                            statistics.upCompletedClients();
                            if (statistics.isEqualCompletedClients(nClients)) {
                                statistics.unsubscribeFromAbsBandwidth();
                                this.lifeCompleteCallback();
                            }

                            break;
                    }
                });
        });
    };

    onMasterServerResponse = (response) => {

        const {
            lastProcessingTime,
            requestCounter,
            id
        } = response;

        this.lifeInfoCallback({id, requestCounter});
        this.statistics.totalProcessingTime += lastProcessingTime;
    };


}