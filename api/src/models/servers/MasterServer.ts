import Server from "../Server";
import {ServerData} from "../../../typings/index";
import RegionServer from "./RegionServer";
import HRow from "../HRow";
import DistributionBehavior from "../servers/behaviors/DistributionBehavior";
import HRegion from "../HRegion";

import {Observable, Subscription} from "rxjs";

import {
    RABBITMQ_EXCHANGE_REGION_SERVERS,
    RABBITMQ_QUEUE_MASTER_SERVER
} from "./../../constants/rabbitmq";
import {hash} from "../../helpers/index";

export default class MasterServer extends Server {

    isMaster: boolean;

    distrubutionBehavior: DistributionBehavior;

    subordinates: Array<RegionServer>;

    registry: Array<HRegion>; // ???

    subscriptionForClients: Subscription;
    subscriptionsMap: {[key: string]: Subscription} = {};

    constructor(provider, serverData: ServerData) {
        super(provider);

        const {isMaster} = serverData;
        this.isMaster = isMaster;
        this.subordinates = [];
    };

    save(hRow: HRow) {
        const {getRegionServerNo} = this.distrubutionBehavior;
        const serverRegionNo = getRegionServerNo(hRow, this.subordinates.length);
        this.subordinates[serverRegionNo].save(hRow);

        console.log(false, `Region no ${serverRegionNo}`);
    }

    getSlaveServersNumber() {
        return this.subordinates.length;
    }

    prepare() {

        this.listen(RABBITMQ_QUEUE_MASTER_SERVER);

        const promises = [];
        this.subordinates.forEach(regionServer => {
            promises.push(regionServer.listenExchange(RABBITMQ_EXCHANGE_REGION_SERVERS));
        });

        return Promise.all(promises);
    }

    listen(queueName, callback = (...args)=>{}, lazy = false) {

        console.log('Мастер-сервер ожидает запросы...');

        const observable = new Observable(observer => {

            this.provider
                .consume(queueName, { lazy })
                .subscribe(response => {
                    // from Clients

                    const {onClientReply, clientId} = response;
                    console.log(`Мастер-сервер получил запрос от клиента #${clientId}`);

                    const {getRegionServerNo} = this.distrubutionBehavior;
                    const serverRegionNo = getRegionServerNo(null, this.subordinates.length);
                    const regionServer = this.subordinates[serverRegionNo];
                    console.log(`Мастер-сервер перенаправляет запрос от клиента #${clientId} на регион-сервер #${regionServer.id}`);

                    this
                        .redirectToRegionServer(regionServer, {clientId})
                        .then(responseFromRegionServer => {
                            onClientReply(responseFromRegionServer);
                            observer.next(responseFromRegionServer);
                        });
                });
        });

        this.subscriptionForClients = observable.subscribe(callback);
    }

    redirectToRegionServer(regionServer: RegionServer, data) {

        return new Promise((resolve, reject) => {

            const routeKey = regionServer.id;
            const subKey = hash(routeKey, Date.now());
            this.subscriptionsMap[subKey] = this.provider
                .publishAndWaitByRouteKeys(RABBITMQ_EXCHANGE_REGION_SERVERS, [routeKey], {...data, subKey})
                .subscribe(response => {
                    // from RegionServer

                    switch (response.type) {
                        case 'sent':
                            break;

                        case 'received':

                            const {regionServerId, clientId, subKey} = response;
                            console.log(`Мастер-сервер получил ответ с регион-сервера ${regionServerId} на запрос от клиента #${clientId}`);

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
    }


}