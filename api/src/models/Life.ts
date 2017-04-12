import RabbitMQ from "../services/RabbitMQ";
import ExpectantClient from "./clients/Expectant";
import MasterServer from "./servers/MasterServer";
import SlaveServer from "./servers/SlaveServer";
import MapGenerator from "./MapGenerator";
import Statistics from "./Statistics";
import {RandomSleepCalculating} from "./servers/behaviors/calculate";
import SocketLogEmitter from "../services/SocketLogEmitter";
import {TestSlaveSelecting} from "./servers/behaviors/slave-selecting/index";
import {RESPONSE_TYPE_STOPPED, RESPONSE_TYPE_RECEIVED, RESPONSE_TYPE_SENT} from "../constants/index";

export class Life {

    private static initServers(serversData) {

        const masterServer = new MasterServer(new RabbitMQ());

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

        const {servers, clients} = lifeData;
        if (!servers.find(it => it.isMaster)) {
            this.lifeCompleteCallback();
            return;
        }

        this.masterServer = Life.initServers(servers);
        if (!this.masterServer.getSlavesNumber()) {
            this.lifeCompleteCallback();
            return;
        }

        this.createCluster(lifeData);

        this.statistics = new Statistics({
            nServers: servers.length,
            nClients: clients.length
        });

        this.simulateWorkWithBigData(lifeData);

        // statistics.subscribeToAbsBandwidth(absBandwidth => this.lifeInfoCallback({
        //     type: 'load_line',
        //     absBandwidth
        // }));
    };

    startClientsRequests = (lifeData) => {
        const {clients, requestTimeLimit, requestsLimit, sqls} = lifeData;
        SocketLogEmitter.instance.setBatchSize(requestsLimit * clients.length);

        clients.forEach(clientData => {
        // [clients[0]].forEach(clientData => {

            const nRequests = +clientData['nRequests'];
            const client = new ExpectantClient(new RabbitMQ(), sqls);
            client.requestTimeLimit = requestTimeLimit;

            console.log(`Создан новый клиент #${client.id}`);

            client
                .requestsToMasterServer(nRequests, this.onMasterResponse);
        });
    };

    onMasterResponse = (response) => {
        const {statistics} = this;

        switch (response.type) {

            case RESPONSE_TYPE_SENT:
                statistics.upRequests();
                break;

            case RESPONSE_TYPE_RECEIVED:

                const {
                    processingTime,
                    slavesPiesData,
                    error
                } = response;

                if (error === 404) {
                    statistics.upUnsuccessufulRequests();

                } else {

                    slavesPiesData.forEach(({slaveId, requestCounter}) => {
                        this.lifeInfoCallback({slaveId, requestCounter});
                    });

                    statistics.totalProcessingTime += processingTime;
                }

                break;

            case RESPONSE_TYPE_STOPPED:
                statistics.upCompletedClients();
                if (statistics.isEqualCompletedClients()) {
                    statistics.unsubscribeFromAbsBandwidth();
                    this.lifeCompleteCallback();
                }

                break;
        }
    };

    destroy() {
        this.masterServer.close();
    }

}