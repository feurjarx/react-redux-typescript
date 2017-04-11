import Server from "../Server";
import {ServerData, SqlParts, Criteria} from "../../../typings/index";
import SlaveServer from "./SlaveServer";
import HRow from "../HRow";
import ShardingBehavior from "./behaviors/sharding/ShardingBehavior";
import {Subscription} from "rxjs";

import {
    RABBITMQ_EXCHANGE_SLAVE_SERVERS,
    RABBITMQ_QUEUE_MASTER_SERVER
} from "./../../constants/rabbitmq";

import {hash, composition, unique, qtrim} from "../../helpers/index";
import {
    VerticalSharding,
    HorizontalSharding
} from "./behaviors/sharding";

import {
    SHARDING_TYPE_HORIZONTAL,
    SHARDING_TYPE_VERTICAL
} from "./../../constants"
import SlaveSelectingBehavior from "./behaviors/slave-selecting/SlaveSelectingBehavior";

interface ShardingProps {
    type: string;
    slaveId?: string;
    fieldName?: string;
}

export default class MasterServer extends Server {

    isMaster: boolean;

    shardingBehavior: ShardingBehavior;
    slaveSelectingBehavior: SlaveSelectingBehavior;

    subordinates: Array<SlaveServer>;

    vGuideMap = {};
    guideMap = {};

    clientsSubscription: Subscription;
    subscriptionsMap: {[key: string]: Subscription} = {};

    constructor(provider, serverData: ServerData) {
        super(provider);

        const {isMaster} = serverData;
        this.isMaster = isMaster;
        this.subordinates = [];
    };

    setSharding(sharding = {}) {
        const {type} = sharding as ShardingProps;
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

    getSlaveServerById(id) {
        return this.subordinates.find(slave => slave.id === id);
    }

    updateGuideMaps(hRow: HRow, slaveId, {serverId = null}) {

        if (serverId) {
            // v-sharding
            this.vGuideMap[hRow.tableName] = serverId;

        } else {
            // h-sharding
            hRow.getFields().forEach(arrow => {
                const guideKey = HRow.getGuideArrowKey(arrow);
                this.guideMap[guideKey] = slaveId;
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
        const safeLimit = this.getSlaveServersNumber() ** 2;
        const slavesIds = this.getSlaveServersIds();

        do {
            slaveId = getSlaveServerId(hRow, slavesIds, {
                ...shardingOptions,
                attemptCounter
            });

            completed = this
                .getSlaveServerById(slaveId)
                .save(hRow);

        } while (repeated && !completed && ++attemptCounter < safeLimit);

        if (!completed) {
            throw new Error(`Запись размером ${hRow.getSize()} не была записана (Регион сервер ${slaveId}, ${this.shardingBehavior.type})`);
        }

        this.updateGuideMaps(hRow, slaveId, shardingOptions);

        console.log(false, `Select slave server ${slaveId}`);
    }

    getSlaveServersNumber() {
        return this.subordinates.length;
    }

    getSlaveServersIds() {
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

    getCriteriaCases(where = ''): Array<Criteria[]> {
        where = where.toLowerCase();

        const ins = [];
        const ors = [];
        const operators = ['=', '<', '>', 'in'];

        where.split('or').forEach((orCase: string) => {
            orCase = orCase.trim();

            const ands: Array<Criteria> = [];
            orCase.split('and').forEach((andCase: string) => {
                andCase = andCase.trim();

                for (let i = 0; i < operators.length; i++) {
                    const operator = operators[i];

                    let [left, value] = andCase.split(operator).map(it => it.trim());
                    if (value) {

                        if (operator === 'in') {
                            ins.push(andCase);
                            continue;
                        }

                        const [table, field] = left.split('.');

                        value = qtrim(value);

                        ands.push({
                            table,
                            field,
                            operator,
                            value,
                            isPrimaryField: field === 'id'
                        });

                        break;
                    }
                }
            });

            if (ands.length) {
                ors.push(ands);
            }
        });

        // operator IN transformation to {'or', '='}
        ins.forEach(inItem => {
            let [left, right] = inItem.split('in').map(it => it.trim());
            const [table, field] = left.split('.');

            right = right.slice(1, -1); // remove '(' and ')'
            const inValues = right.split(',');
            inValues.forEach(v => {
                ors.push([{
                    table,
                    field,
                    operator: '=',
                    value: qtrim(v),
                    isPrimaryField: field === 'id'
                }])
            });
        });

        return ors;
    }

    getSlaveServersIdsBySql(sqlParts: SqlParts) {

        const result = [];

        const tableName = sqlParts.from[0];

        // check as vertical sharding
        if (this.vGuideMap[tableName]) {
            result.push(this.vGuideMap[tableName]);

        } else {

            const criteriaCases = this.getCriteriaCases(sqlParts.where);
            if (criteriaCases.length) {

                criteriaCases.forEach((ands: Array<Criteria>) => {

                    let slavesIds = [];
                    let primaryFieldName = null;

                    for (let i = 0; i < ands.length; i++) {
                        const criteria = ands[i];

                        if (criteria.operator !== '=') {
                            slavesIds = [];
                            break;
                        }

                        // for '='
                        if (primaryFieldName === criteria.table + '.' + criteria.field) {
                            slavesIds = [];
                            // for, example "... WHERE user.id = 1 and user.id = 2"
                            break;
                        }

                        const guideKey = HRow.getGuideArrowKey(criteria);
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
        }

        return unique(result);
    }

    listen(queueName, lazy = false) {

        console.log('Мастер-сервер ожидает запросы...');

        this.clientsSubscription = this.provider
            .consume(queueName, { lazy })
            .subscribe(clientRequest => {
                // from Clients

                const {onClientReply, clientId, sqlParts} = clientRequest;
                console.log(`Мастер-сервер получил запрос от клиента #${clientId}`);

                // для простых случае с оператором "="
                let slavesIds = this.getSlaveServersIdsBySql(sqlParts);
                if (!slavesIds.length) {
                    slavesIds = this.getSlaveServersIds();
                }

                const promises = [];
                slavesIds.forEach(slaveId => {
                    const slave = this.getSlaveServerById(slaveId);
                    console.log(`Мастер-сервер перенаправляет запрос от клиента #${clientId} на регион-сервер #${slaveId}`);

                    promises.push(this.redirectToSlaveServer(slave, {clientId, sqlParts}));
                });

                if (promises.length) {
                    Promise.all(promises).then(responses => {

                        const lastProcessingTime = responses.reduce((sum, it) => sum + it.lastProcessingTime, 0) / responses.length;
                        const slavesNames =  responses.map(it => it.slaveId);

                        const slaves = responses.map(it => ({
                            requestCounter: it.requestCounter,
                            slaveId: it.slaveId
                        }));

                        onClientReply({
                            type: 'received',
                            slaves,
                            slavesNames,
                            lastProcessingTime: Math.round(lastProcessingTime)
                        });
                    });

                } else {

                    onClientReply([{error: 404}]);
                }
            });

    }

    redirectToSlaveServer(slave: SlaveServer, data) {

        return new Promise((resolve, reject) => {

            const routeKey = slave.id;
            const subKey = hash(routeKey, Date.now());
            this.subscriptionsMap[subKey] = this.provider
                .publishAndWaitByRouteKeys(RABBITMQ_EXCHANGE_SLAVE_SERVERS, [routeKey], {...data, subKey})
                .subscribe(response => {
                    // from SlaveServer

                    switch (response.type) {
                        case 'sent':
                            break;

                        case 'received':

                            const {slaveId, clientId, subKey} = response;
                            console.log(`Мастер-сервер получил ответ с регион-сервера ${slaveId} на запрос от клиента #${clientId}`);

                            resolve(response);

                            this.subscriptionsMap[subKey].unsubscribe();

                            break;
                        default:
                            throw new Error(`Unexpected response type from server. Type: ${ response.type }`);
                    }
                });
        });
    }

    close() {
        super.close();
        this.subordinates.forEach(s => s.close());
        this.clientsSubscription.unsubscribe();
    }


}