import RabbitMQ from "../services/RabbitMQ";
import ExpectantClient from "./clients/Expectant";
import MasterServer from "./servers/MasterServer";
import SlaveServer from "./servers/SlaveServer";
import MapGenerator from "./MapGenerator";
import Statistics from "./Statistics";
import {RandomSleepCalculating} from "./servers/behaviors/calculate";
import SocketLogEmitter from "../services/SocketLogEmitter";
import {TestSlaveSelecting} from "./servers/behaviors/slave-selecting/index";

export class Life {

    private static initServers(serversData) {

        const masterServer = new MasterServer(
            new RabbitMQ(),
            serversData.find(it => it.isMaster)
        );

        // masterServer.slaveSelectingBehavior = RandomSlaveSelecting.instance;
        masterServer.slaveSelectingBehavior = TestSlaveSelecting.instance;

        for (let i = 0; i < serversData.length; i++) {
            const serverData = serversData[i];
            if (!serverData.isMaster) {
                const server = new SlaveServer(new RabbitMQ(), serverData);
                server.calculateBehavior = new RandomSleepCalculating(200);
                server.id = serverData.name;
                masterServer.subordinates.push(server);
            }
        }

        return masterServer;
    }

    private masterServer: MasterServer;
    private statistics: Statistics;

    private lifeCompleteCallback = Function();
    private lifeInfoCallback = Function();
    private bigDataInfoCallback = Function();

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

    private createCluster(data) {

        const {tables, dbSize} = data;

        const {masterServer} = this;
        // const totalSize = dbSize * 1000;
        MapGenerator.fillRegions({tables}, masterServer);

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

        const {servers, sqls} = lifeData;
        if (!servers.find(it => it.isMaster)) {
            this.lifeCompleteCallback();
            return;
        }

        this.masterServer = Life.initServers(servers);
        if (!this.masterServer.getSlaveServersNumber()) {
            this.lifeCompleteCallback();
            return;
        }

        this.createCluster(lifeData);

        this.statistics = new Statistics({nServers: servers.length});

        this.simulateWorkWithBigData(lifeData);

        // statistics.subscribeToAbsBandwidth(absBandwidth => this.lifeInfoCallback({
        //     type: 'load_line',
        //     absBandwidth
        // }));
    };

    startClientsRequests = (lifeData) => {
        const {clients, requestTimeLimit, requestsLimit, sqls} = lifeData;
        const {statistics} = this;
        const nClients = clients.length;
        SocketLogEmitter.instance.setBatchSize(requestsLimit * nClients);

        clients.forEach(clientData => {
        // [clients[0]].forEach(clientData => {

            const nRequests = +clientData['nRequests'];
            const client = new ExpectantClient(new RabbitMQ(), sqls);
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
                                slaves,
                                error
                            } = response;

                            if (error === 404) {
                                statistics.upUnsuccessufulRequests();

                            } else {

                                slaves.forEach(({slaveId, requestCounter}) => {
                                    this.lifeInfoCallback({slaveId, requestCounter});
                                });

                                statistics.totalProcessingTime += lastProcessingTime;
                            }

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
            slaveId
        } = response;

        this.lifeInfoCallback({slaveId, requestCounter});
        this.statistics.totalProcessingTime += lastProcessingTime;
    };


    destroy() {
        this.masterServer.close();
    }

}