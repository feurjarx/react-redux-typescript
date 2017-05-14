import RabbitMQ from "../services/RabbitMQ";
import ExpectantClient from "./clients/Expectant";
import MasterServer from "./servers/MasterServer";
import Statistics from "./Statistics";
import SocketLogEmitter from "../services/SocketLogEmitter";

import {
    RESPONSE_TYPE_RECEIVED,
    RESPONSE_TYPE_STOPPED,
    RESPONSE_TYPE_SENT,
    CHART_TYPE_REQUESTS_DIAGRAM,
    CHART_TYPE_SLAVES_LOAD, RESPONSE_TYPE_FULL_STOPPED
} from "../constants/index";

import {FIELD_TYPE_NUMBER, HDD_ASPECT_RATIO} from "../constants/index";
import {TableData} from "../../typings/index";
import {hash} from "../helpers/index";
import HRow from "./HRow";
import {GlobalCounter} from "../services/GlobalCounter";
import {GLOBAL_COUNTER_SQL_QUICK, GLOBAL_COUNTER_SQL_NORMAL} from "../constants/global-counter";

export class Life {

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

        this.fillRegions(tables);

        const regionsPiesCharts = masterServer.subordinates.map(server => ({
            serverName: server.id,
            chartData: server.getRegionalStatistics()
        }));

        this.bigDataInfoCallback({regionsPiesCharts});
    };

    private fillRegions(tables: Array<TableData>) {

        tables.forEach(table => {

            const {fields, sharding = {}} = table;
            if (!fields.find(f => f.name === 'created_at')) {
                fields.push({
                    name: 'created_at',
                    type: FIELD_TYPE_NUMBER
                });
            }

            const tableSize = HDD_ASPECT_RATIO * table.tableSize;
            const tableName = table.name;

            let tableSizeCounter = 0;
            for (let i = 0; tableSizeCounter < tableSize; i++) {
                const id = i + 1;

                const rowKey = hash(tableName, id, Date.now());
                const hRow = new HRow(rowKey, tableName);
                hRow.id = id;
                hRow.define(fields);

                const shardingType = sharding.type || 'normal';
                this.masterServer.setShardingType(shardingType);
                this.masterServer.save(hRow, sharding);

                tableSizeCounter += hRow.getSize();
            }
        });
    }

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

        const masterServer = MasterServer.make(servers);
        if (!masterServer) {
            this.lifeCompleteCallback();
            return;
        }

        this.masterServer = masterServer;

        this.createCluster(lifeData);

        this.statistics = new Statistics({
            nServers: servers.length,
            nClients: clients.length
        });

        GlobalCounter.init(GLOBAL_COUNTER_SQL_QUICK);
        GlobalCounter.init(GLOBAL_COUNTER_SQL_NORMAL);

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
                    this.gameover();
                }

                break;

            case RESPONSE_TYPE_FULL_STOPPED:
                this.gameover();
                break;
        }
    };


    gameover() {
        this.statistics.unsubscribeFromProp(Statistics.SLAVES_LAST_PROCESSING_TIME_LIST);

        this.lifeCompleteCallback();

        GlobalCounter.reset();

        setTimeout(() => {
            this.masterServer.close();
            this.active = false;
            SocketLogEmitter.instance.emitForce(); // остаток логов на выпуск
        }, 5000);
    }

    destroy() {
        this.masterServer.close();
    }
}