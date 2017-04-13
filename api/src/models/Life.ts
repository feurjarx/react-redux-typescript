import RabbitMQ from "../services/RabbitMQ";
import ExpectantClient from "./clients/Expectant";
import MasterServer from "./servers/MasterServer";
import SlaveServer from "./servers/SlaveServer";
import MapGenerator from "./MapGenerator";
import Statistics from "./Statistics";
import {RandomSleepCalculating} from "./servers/behaviors/calculate";
import SocketLogEmitter from "../services/SocketLogEmitter";

import {
    RESPONSE_TYPE_RECEIVED,
    RESPONSE_TYPE_STOPPED,
    RESPONSE_TYPE_SENT,
    CHART_TYPE_REQUESTS_DIAGRAM,
    CHART_TYPE_SLAVES_LOAD
} from "../constants/index";

export class Life {

    private static initServers(serversData) {

        const masterServer = new MasterServer(new RabbitMQ());

        for (let i = 0; i < serversData.length; i++) {
            const serverData = serversData[i];
            if (!serverData.isMaster) {
                const server = new SlaveServer(new RabbitMQ(), serverData);
                server.calculateBehavior = new RandomSleepCalculating(500);
                server.id = serverData.name;
                masterServer.subordinates.push(server);
            }
        }

        return masterServer;
    }

    active: boolean;

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

        const {tables} = data;

        const {masterServer} = this;
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

        this.active = true;

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

        this.statistics.subscribeToProp(
            Statistics.SLAVES_LAST_PROCESSING_TIME_LIST,
            data => this.lifeInfoCallback(data, CHART_TYPE_SLAVES_LOAD)
        );
    };

    startClientsRequests = (lifeData) => {
        const {clients, requestTimeLimit, requestsLimit, sqls} = lifeData;
        SocketLogEmitter.instance.setBatchSize(requestsLimit * clients.length);

        clients.forEach(clientData => {
        // [clients[0]].forEach(clientData => {

            const nRequests = +clientData['nRequests'];
            const client = new ExpectantClient(new RabbitMQ(), sqls);

            console.log(`Создан новый клиент: #${client.id}`);

            client.requestsToMasterServer(nRequests, this.onMasterResponse);
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
                    slavesRequestsDiagramData,
                    slavesProcessingTimeList,
                    processingTime,
                    error
                } = response;

                if (error === 404) {
                    statistics.upUnsuccessufulRequests();

                } else {

                    slavesRequestsDiagramData.forEach(chartData => {
                        this.lifeInfoCallback(chartData, CHART_TYPE_REQUESTS_DIAGRAM);
                    });

                    slavesProcessingTimeList.forEach((time, i) => {
                        this.statistics.setLastProcessingTime(i, time);
                    });


                    statistics.totalProcessingTime += processingTime;
                }

                break;

            case RESPONSE_TYPE_STOPPED:

                statistics.upCompletedClients();
                if (statistics.isEqualCompletedClients()) {
                    statistics.unsubscribeFromProp(Statistics.SLAVES_LAST_PROCESSING_TIME_LIST);

                    this.lifeCompleteCallback();
                    setTimeout(() => {
                        this.masterServer.close();
                        this.active = false;
                        SocketLogEmitter.instance.emitForce(); // остаток логов на выпуск
                    }, 5000);
                }

                break;
        }
    };

    destroy() {
        this.masterServer.close();
    }
}