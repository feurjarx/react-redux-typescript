import Server from "../Server";
import {ServerData} from "../../../typings/index";
import SlaveServer from "./SlaveServer";
import HRow from "../HRow";
import ShardingBehavior from "./behaviors/sharding/ShardingBehavior";
import HRegion from "../HRegion";
import {Subscription} from "rxjs";

import {
    RABBITMQ_EXCHANGE_SLAVE_SERVERS,
    RABBITMQ_QUEUE_MASTER_SERVER
} from "./../../constants/rabbitmq";

import {hash} from "../../helpers/index";
import {
    VerticalSharding,
    HorizontalSharding,
    RandomSharding
} from "./behaviors/sharding";

import {
    SHARDING_TYPE_DEFAULT,
    SHARDING_TYPE_HORIZONTAL,
    SHARDING_TYPE_VERTICAL
} from "./../../constants"
import SlaveSelectingBehavior from "./behaviors/slave-selecting/SlaveSelectingBehavior";

interface ShardingProps {
    type: string;
    serverId?: string;
    fieldId?: string;
}

export default class MasterServer extends Server {

    isMaster: boolean;

    shardingBehavior: ShardingBehavior;
    slaveSelectingBehavior: SlaveSelectingBehavior;

    subordinates: Array<SlaveServer>;

    registry: Array<HRegion>; // ???

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
            case SHARDING_TYPE_DEFAULT:
                break;

            case SHARDING_TYPE_VERTICAL:
                this.shardingBehavior = VerticalSharding.instance;
                break;

            case SHARDING_TYPE_HORIZONTAL:
                this.shardingBehavior = HorizontalSharding.instance;
                break;

            default:
                this.shardingBehavior = RandomSharding.instance;
        }
    }

    getSlaveServerById(id) {
        return this.subordinates.find(slave => slave.id === id);
    }

    save(hRow: HRow, shardingOptions = {}) {
        const {
            repeated,
            getSlaveServerId
        } = this.shardingBehavior;

        let completed: boolean;
        let slaveServerId: any;

        let attemptCounter = 0;
        const safeLimit = this.getSlaveServersNumber() ** 2;
        const slaveServersIds = this.getSlaveServersIds();

        do {
            slaveServerId = getSlaveServerId(hRow, slaveServersIds, {
                ...shardingOptions,
                attemptCounter
            });

            completed = this
                .getSlaveServerById(slaveServerId)
                .save(hRow);

        } while (repeated && !completed && ++attemptCounter < safeLimit);

        if (!completed) {
            throw new Error(`Запись размером ${hRow.getSize()} не была записана (Регион сервер ${slaveServerId}, ${this.shardingBehavior.title})`);
        }

        console.log(false, `Select slave server ${slaveServerId}`);
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
        this.subordinates.forEach(slaveServer => {
            promises.push(slaveServer.listenExchange(RABBITMQ_EXCHANGE_SLAVE_SERVERS));
        });

        return Promise.all(promises);
    }

    listen(queueName, lazy = false) {

        console.log('Мастер-сервер ожидает запросы...');

        this.clientsSubscription = this.provider
            .consume(queueName, { lazy })
            .subscribe(clientRequest => {
                // from Clients

                const {onClientReply, clientId} = clientRequest;
                console.log(`Мастер-сервер получил запрос от клиента #${clientId}`);

                const {getSlaveServerId} = this.slaveSelectingBehavior;
                const slaveServerId = getSlaveServerId(this.getSlaveServersIds());
                const slaveServer = this.getSlaveServerById(slaveServerId);
                console.log(`Мастер-сервер перенаправляет запрос от клиента #${clientId} на регион-сервер #${slaveServer.id}`);

                this
                    .redirectToSlaveServer(slaveServer, {clientId})
                    .then(onClientReply);
            });

    }

    redirectToSlaveServer(slaveServer: SlaveServer, data) {

        return new Promise((resolve, reject) => {

            const routeKey = slaveServer.id;
            const subKey = hash(routeKey, Date.now());
            this.subscriptionsMap[subKey] = this.provider
                .publishAndWaitByRouteKeys(RABBITMQ_EXCHANGE_SLAVE_SERVERS, [routeKey], {...data, subKey})
                .subscribe(response => {
                    // from SlaveServer

                    switch (response.type) {
                        case 'sent':
                            break;

                        case 'received':

                            const {slaveServerId, clientId, subKey} = response;
                            console.log(`Мастер-сервер получил ответ с регион-сервера ${slaveServerId} на запрос от клиента #${clientId}`);

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