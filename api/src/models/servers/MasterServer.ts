import Server from "../Server";
import {ServerData} from "../../../typings/index";
import SlaveServer from "./SlaveServer";
import HRow from "../HRow";
import DistributionBehavior from "../servers/behaviors/DistributionBehavior";
import HRegion from "../HRegion";

import {Observable, Subscription} from "rxjs";

import {
    RABBITMQ_EXCHANGE_SLAVE_SERVERS,
    RABBITMQ_QUEUE_MASTER_SERVER
} from "./../../constants/rabbitmq";
import {hash} from "../../helpers/index";

export default class MasterServer extends Server {

    isMaster: boolean;

    distrubutionBehavior: DistributionBehavior;

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

    save(hRow: HRow) {
        const {getSlaveServerNo} = this.distrubutionBehavior;

        let attemptCounter = 0;
        let idx: number;
        let completed: boolean;
        const safeLimit = this.getSlaveServersNumber() ** 2;

        do {
            attemptCounter++;
            idx = getSlaveServerNo(hRow, this.subordinates.length);
            completed = this.subordinates[idx].save(hRow);
        } while (!completed && attemptCounter < safeLimit);

        if (!completed) {
            throw new Error(`Запись размером ${hRow.getSize()} не была записана ни в один регион`);
        }

        console.log(false, `Region no ${idx}`);
    }

    getSlaveServersNumber() {
        return this.subordinates.length;
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

                const {getSlaveServerNo} = this.distrubutionBehavior;
                const idx = getSlaveServerNo(null, this.subordinates.length);
                const slaveServer = this.subordinates[idx];
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