import Server from "../Server";
import {SqlQueryParts, Criteria} from "../../../typings/index";
import SlaveServer from "./SlaveServer";
import HRow from "../HRow";
import ShardingBehavior from "./behaviors/sharding/ShardingBehavior";
import {Subscription} from "rxjs";

import {
    RABBITMQ_EXCHANGE_SLAVE_SERVERS,
    RABBITMQ_QUEUE_MASTER_SERVER
} from "./../../constants/rabbitmq";

import {hash, unique} from "../../helpers/index";
import {
    VerticalSharding,
    HorizontalSharding
} from "./behaviors/sharding";

import {
    SHARDING_TYPE_HORIZONTAL,
    SHARDING_TYPE_VERTICAL, SQL_OPERATOR_EQ, RESPONSE_TYPE_RECEIVED, RESPONSE_TYPE_SENT
} from "./../../constants"
import SlaveSelectingBehavior from "./behaviors/slave-selecting/SlaveSelectingBehavior";
import SqlSyntaxService from "../../services/SqlSyntaxService";
import {IQueue} from "../../services/IQueue";
import RabbitMQ from "../../services/RabbitMQ";
import {RandomSleepCalculating} from "./behaviors/calculate/index";

export default class MasterServer extends Server {

    shardingBehavior: ShardingBehavior;

    subordinates: Array<SlaveServer> = [];

    vGuideMap = {};
    guideMap = {};

    clientsSubscription: Subscription;
    slavesSubscriptionsMap: {[key: string]: Subscription} = {};

    static make(serversData) {

        if (!serversData.length) {
            return null;
        }

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

    constructor(provider) {
        super(provider);
    };

    setShardingType(type) {
        switch (type) {
            case SHARDING_TYPE_VERTICAL:
                this.shardingBehavior = VerticalSharding.instance;
                break;

            case SHARDING_TYPE_HORIZONTAL:
                this.shardingBehavior = HorizontalSharding.instance;
                break;

            default:
                this.shardingBehavior = HorizontalSharding.instance;
        }
    }

    getSlaveById(id) {
        return this.subordinates.find(slave => slave.id === id);
    }

    updateGuideMaps(hRow: HRow, slaveId, {serverId = null}) {

        if (serverId) {
            // v-sharding
            this.vGuideMap[hRow.tableName] = serverId;

        } else {
            // h-sharding
            hRow.getArrowKeys().forEach(arrowKey => {
                this.guideMap[arrowKey] = slaveId;
            });
        }
    }

    save(hRow: HRow, shardingOptions = {}) {
        const {
            repeated,
            getSlaveServerId
        } = this.shardingBehavior;

        let completed: boolean;
        let slaveId: any;

        let attemptCounter = 0;
        const safeLimit = this.getSlavesNumber() ** 2;
        const slavesIds = this.getSlavesIds();

        do {
            slaveId = getSlaveServerId(hRow, slavesIds, {
                ...shardingOptions,
                attemptCounter
            });

            completed = this
                .getSlaveById(slaveId)
                .save(hRow);

        } while (repeated && !completed && ++attemptCounter < safeLimit);

        if (!completed) {
            throw new Error(`Запись размером ${hRow.getSize()} не была записана (Регион сервер ${slaveId}, ${this.shardingBehavior.type})`);
        }

        this.updateGuideMaps(hRow, slaveId, shardingOptions);

        console.log(false, `Выбран slave #${slaveId}`);
    }

    getSlavesNumber() {
        return this.subordinates.length;
    }

    getSlavesIds() {
        return this.subordinates.map(s => s.id);
    }

    prepare() {

        this.listen(RABBITMQ_QUEUE_MASTER_SERVER);

        const promises = [];
        this.subordinates.forEach(slave => {
            promises.push(slave.listenExchange(RABBITMQ_EXCHANGE_SLAVE_SERVERS));
        });

        return Promise.all(promises);
    }

    getSlavesIdsBySql(sqlQueryParts: SqlQueryParts) {

        const result = [];

        const tableName = sqlQueryParts.from[0];

        // check v-sharding
        if (this.vGuideMap[tableName]) {
            result.push(this.vGuideMap[tableName]);

        } else {

            SqlSyntaxService.instance
                .getAndsListFromWhere(sqlQueryParts.where)
                .forEach((ands: Array<Criteria>) => {

                    let slavesIds = [];
                    let primaryFieldName = null;

                    for (let i = 0; i < ands.length; i++) {
                        const criteria = ands[i];

                        if (criteria.operator !== SQL_OPERATOR_EQ) {
                            slavesIds = [];
                            break;
                        }

                        // for '='
                        if (primaryFieldName === criteria.table + '.' + criteria.field) {
                            slavesIds = [];
                            // for, example "... WHERE user.id = 1 and user.id = 2"
                            break;
                        }

                        const guideKey = HRow.calcArrowKey(criteria);
                        const slaveId = this.guideMap[guideKey];
                        if (!slaveId) {
                            slavesIds = [];
                            break;
                        }

                        slavesIds.push(slaveId);

                        if (criteria.isPrimaryField) {
                            primaryFieldName = criteria.table + '.' + criteria.field;
                        }
                    }

                    result.push(...slavesIds);
                });
        }

        return unique(result);
    }

    listen(queueName, lazy = false) {

        console.log('Мастер-сервер ожидает запросы...');

        this.clientsSubscription = this.provider
            .consume(queueName, { lazy })
            .subscribe(clientRequest => {

                // clientRequest.onReply({error: 404});

                let processingTimeCounter = 0;

                const {clientId, sqlQueryParts} = clientRequest;
                const onClientReply = clientRequest.onReply;
                console.log(`Мастер-сервер получил запрос от клиента #${clientId}: ${sqlQueryParts.raw}`);

                if (sqlQueryParts.select) {

                    // для простых случае с оператором "=" по словарям
                    let slavesIds = this.getSlavesIdsBySql(sqlQueryParts);
                    if (!slavesIds.length) {
                        slavesIds = this.getSlavesIds();
                    }

                    const promises = [];
                    slavesIds.forEach(slaveId => {
                        const slave = this.getSlaveById(slaveId);
                        console.log(`Мастер-сервер перенаправляет запрос от клиента #${clientId} на регион-сервер #${slaveId}`);

                        promises.push(this.redirectToSlaveServer(slave, {clientId, sqlQueryParts}, new RabbitMQ()));

                        processingTimeCounter += slave.calcTransferTime();
                    });

                    if (promises.length) {
                        Promise.all(promises).then(responses => {

                            const processingTimeAvg = Math.round(
                                responses.reduce((sum, it) => sum + it.processingTime, 0) / responses.length
                            );

                            const slavesNames = responses.map(it => it.slaveId);
                            const slavesRequestsDiagramData = responses.map(it => ({
                                requestsCounter: it.requestsCounter,
                                slaveId: it.slaveId
                            }));

                            const slavesProcessingTimeList = responses.map(it => it.processingTime);

                            onClientReply({
                                type: RESPONSE_TYPE_RECEIVED,
                                slavesRequestsDiagramData,
                                slavesProcessingTimeList,
                                slavesNames,
                                processingTime: processingTimeCounter + processingTimeAvg // среднее, потому что slave ищут параллельно
                            });
                        });

                    } else {

                        onClientReply({error: 404});
                    }

                } else {
                    // TODO: INSERT, UPDATE
                }
            });

    }

    redirectToSlaveServer(slave: SlaveServer, data, tempProvider: IQueue = null) {

        let provider: IQueue;
        let autoclose: boolean;

        if (tempProvider) {
            provider = tempProvider;
            autoclose = true;
        } else {
            provider = this.provider;
            autoclose = false;
        }

        return new Promise((resolve, reject) => {

            const routeKey = slave.id;
            const subKey = hash(routeKey, Date.now());
            this.slavesSubscriptionsMap[subKey] = provider
                .publishAndWaitByRouteKeys(RABBITMQ_EXCHANGE_SLAVE_SERVERS, [routeKey], {...data, subKey}, {autoclose})
                .subscribe(response => {
                    // from SlaveServer

                    switch (response.type) {
                        case RESPONSE_TYPE_SENT:
                            break;

                        case RESPONSE_TYPE_RECEIVED:

                            const {slaveId, clientId, subKey} = response;
                            console.log(`Мастер-сервер получил ответ с регион-сервера #${slaveId} на запрос от клиента #${clientId}`);

                            resolve(response);

                            this.slavesSubscriptionsMap[subKey].unsubscribe();

                            break;
                        default:
                            throw new Error(`Unexpected response type from server. Type: ${ response.type }`);
                    }
                });
        });
    }

    close() {
        super.close();
        console.log(`Мастер #${ this.id } отключен.`);

        this.subordinates.forEach(s => s.close());
        console.log(`Регион-сервера отключены.`);

        this.clientsSubscription.unsubscribe();
    }
}