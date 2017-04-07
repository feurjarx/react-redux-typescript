import Server from "../Server";
import {ServerData} from "../../../typings/index";
import HRow from "../HRow";
import HRegion from "../HRegion";
import {range} from '../../helpers';
import {Subscription} from "rxjs";
import {IQueue} from "../../services/IQueue";

export default class RegionServer extends Server {
    regions: Array<HRegion>;

    hdd: number;
    maxRegions: number;

    regionMaxSize: number;

    subscription: Subscription;

    constructor(provider: IQueue, serverData: ServerData) {
        super(provider);

        this.regions = [];

        const {hdd, maxRegions} = serverData;
        this.hdd = hdd;
        this.maxRegions = maxRegions;

        const regionMaxSize = Math.round(hdd / maxRegions);
        this.regions = range(0, maxRegions)
            .map(id => new HRegion(id, this.id, regionMaxSize));

        this.regionMaxSize = regionMaxSize;
    };

    getRegionalStatistics() {
        return this.regions.map(r => ({
            name: `Регион ${r.id} сервера ${this.id}`,
            value: r.maxSize - r.freeSpace
        }))
    }

    save(hRow: HRow) {

        const {regions} = this;

        for (let i = 0; i < regions.length; i++) {
            const region = regions[i];
            if (region.isFitIn(hRow.getSize())) {
                region.add(hRow);
                break;

            } else {

                this.split(region);
            }
        }
    }

    split(hRegion: HRegion) {

        if (Object.keys(hRegion.rows).length) {

            const rowsList = hRegion.popHalf();
            const {regions} = this;

            const filledRegionsIds = regions
                .filter(r => r.id != hRegion.id)
                .map(r => r.id);

            for (let i = 0; i < rowsList.length; i++) {
                const regionId = filledRegionsIds[i % filledRegionsIds.length];
                regions[regionId].add(rowsList[i]);
            }
        }
    }

    listenExchange(exchange: string) {

        return new Promise(resolve => {
            this.subscription = this.provider
                .consumeByRouteKeys(exchange, [this.id], {resolve})
                .subscribe(this.onRequestFromMasterServer);
        });
    }

    onRequestFromMasterServer = (data) => {
        const {onClientReply, clientId, subKey} = data;
        console.log(`Регион сервер #${this.id} получил от мастера запрос клиента #${clientId}`);
        this.requestCounter++;

        // TODO: read or write regions

        this.calculateBehavior
            .calculate()
            .then(() => {
                console.log(`Регион сервер #${this.id} отправил мастеру ответ на запрос клиента #${clientId}`);
                onClientReply({
                    subKey,
                    clientId,
                    regionServerId: this.id,
                    lastProcessingTime: 0,
                    requestCounter: this.requestCounter
                    // see to Life onMasterServerResponse
                });
            });
    };


}