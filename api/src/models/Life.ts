import RabbitMQ from "../services/RabbitMQ";
import ExpectantClient from "./clients/Expectant";
import MasterServer from "./servers/MasterServer";
import RegionServer from "./servers/RegionServer";
import MapGenerator from "./MapGenerator";
import RandomDistribution from "./servers/behaviors/RandomDistribution";
import Statistics from "./Statistics";
import {Subscription} from "rxjs";
import RandomSleepCalculating from "./servers/behaviors/RandomSleepCalculating";

export class Life {

    private masterServer: MasterServer;
    private statistics: Statistics;

    private lifeCompleteCallback = Function();
    private lifeInfoCallback = Function();
    private bigDataInfoCallback = Function();

    subscribtion: Subscription;

    onLifeComplete(callback = Function()) {
        this.lifeCompleteCallback = callback;

        return this;
    };

    onLifeInfo(callback = Function()) {
        this.lifeInfoCallback = callback;

        return this;
    };

    onBigDataInfo(callback = Function()) {
        this.bigDataInfoCallback = callback;

        return this;
    }

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
                server.calculateBehavior = new RandomSleepCalculating(200);
                server.id = serverData.name;
                masterServer.subordinates.push(server);
            }
        }

        return masterServer;
    }

    private createBigData(data) {

        const {tables, requiredFilledSize} = data;

        const {masterServer} = this;
        const totalSize = requiredFilledSize * 1000;
        MapGenerator.fillRegions({tables, totalSize}, masterServer);

        const regionsPiesCharts = masterServer.subordinates.map(server => ({
            serverName: server.id,
            chartData: server.getRegionalStatistics()
        }));

        this.bigDataInfoCallback({regionsPiesCharts});

        this.masterServer = masterServer;
    };

    simulateWorkWithBigData(lifeData) {
        this.masterServer.prepare().then(() => {
            console.log(`Все регион-сервера готовы.`);
            this.startClientsRequests(lifeData);
        });
    }

    live(lifeData) {

        const {servers} = lifeData;

        this.masterServer = this.initServers(servers);

        this.createBigData(lifeData);

        this.statistics = new Statistics({nServers: servers.length});

        this.simulateWorkWithBigData(lifeData);

        // statistics.subscribeToAbsBandwidth(absBandwidth => this.lifeInfoCallback({
        //     type: 'load_line',
        //     absBandwidth
        // }));

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

                        case 'received':

                            const {
                                lastProcessingTime,
                                requestCounter,
                                regionServerId
                            } = response;

                            this.lifeInfoCallback({regionServerId, requestCounter});
                            this.statistics.totalProcessingTime += lastProcessingTime;

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

    // вызов, когда приходит ответ от регион-сервера
    onMasterServerResponse = (response) => {

        const {
            lastProcessingTime,
            requestCounter,
            regionServerId
        } = response;

        this.lifeInfoCallback({regionServerId, requestCounter});
        this.statistics.totalProcessingTime += lastProcessingTime;
    };


    destroy() {
        // this.subscribtion.unsubscribe();
        this.masterServer.close();
    }

}