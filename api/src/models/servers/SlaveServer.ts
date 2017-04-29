import Server from "../Server";
import {ServerData, ClientRequestFromMaster, SqlQueryParts, Criteria, HRowSelecting} from "../../../typings/index";
import HRow from "../HRow";
import HRegion from "../HRegion";
import {range, unique} from '../../helpers';
import {Subscription} from "rxjs";
import {IQueue} from "../../services/IQueue";
import {
    HDD_ASPECT_RATIO,
    SQL_OPERATOR_EQ,
    SQL_OPERATOR_LT,
    SQL_OPERATOR_GT
} from "../../constants/index";

import SqlSyntaxService from "../../services/SqlSyntaxService";
import {GlobalCounter} from "../../services/GlobalCounter";
import {GLOBAL_COUNTER_SQL_QUICK, GLOBAL_COUNTER_SQL_NORMAL} from "../../constants/global-counter";

export default class SlaveServer extends Server {

    static timePer100Km = 1;

    regions: Array<HRegion>;

    hdd: number;
    maxRegions: number;

    rowsKeysByArrowKeyMap: {[arrowKey: string]: Array<string>} = {};
    regionIdByRowKeyMap: {[rowKey: string]: number} = {};

    regionMaxSize: number;

    subscription: Subscription;

    successfulCounter = 0;

    distanceToMasterKm;

    constructor(provider: IQueue, serverData: ServerData) {
        super(provider);

        this.regions = [];

        const {maxRegions, distanceToMasterKm = 0} = serverData;
        let {hdd} = serverData;
        hdd = HDD_ASPECT_RATIO * hdd;
        this.hdd = hdd;

        this.maxRegions = maxRegions;
        this.distanceToMasterKm = distanceToMasterKm;

        const regionMaxSize = Math.round(hdd / maxRegions);
        this.regions = range(0, maxRegions)
            .map(id => new HRegion(id, this.id, regionMaxSize));

        this.regionMaxSize = regionMaxSize;
    };

    calcTransferTime() {
        return Math.round((this.distanceToMasterKm / 100) * SlaveServer.timePer100Km);
    }

    getRegionalStatistics() {
        return this.regions.map(r => ({
            name: `Регион ${r.id} сервера ${this.id} (всего: ${Math.round(r.maxSize / HDD_ASPECT_RATIO * this.regions.length)})`,
            value: (r.maxSize - r.freeSpace) / HDD_ASPECT_RATIO,
            free: r.freeSpace / HDD_ASPECT_RATIO // for log
        }))
    }

    updateAllGuideMaps(hRow: HRow, regionId: number) {
        this.regionIdByRowKeyMap[hRow.rowKey] = regionId;

        hRow.getIndexedArrowKeys().forEach(arrowKey => {
            if (!this.rowsKeysByArrowKeyMap[arrowKey]) {
                this.rowsKeysByArrowKeyMap[arrowKey] = [];
            }

            this.rowsKeysByArrowKeyMap[arrowKey].push(hRow.rowKey);
        });
    }

    save(hRow: HRow) {

        const {regions} = this;
        let completed = false;

        const needSplitedRegions = [];

        for (let i = 0; i < regions.length; i++) {
            const region = regions[i];
            if (region.isFitIn(hRow.getSize())) {
                region.add(hRow);
                completed = true;

                this.updateAllGuideMaps(hRow, region.id);
                break;

            } else {

                needSplitedRegions.push(region);
            }
        }

        needSplitedRegions.forEach(region => {
            this.split(region);
        });

        // console.log(this.getRegionalStatistics());
        return completed;
    }

    getRegionById(id) {
        return this.regions.find(r => r.id === id);
    }

    split(region: HRegion) {

        if (Object.keys(region.rows).length) {

            const rowsList = region.popHalf();
            const {regions} = this;

            const filledRegionsIds = regions
                .filter(r => r.id != region.id)
                .map(r => r.id);

            for (let i = 0; i < rowsList.length; i++) {
                const nextRegionId = filledRegionsIds[i % filledRegionsIds.length];
                const hRow = rowsList[i];

                regions[nextRegionId].add(hRow);
                this.updateAllGuideMaps(hRow, nextRegionId);
            }
        }
    }

    listenExchange(exchange: string) {

        return new Promise(resolve => {
            this.subscription = this.provider
                .consumeByRouteKeys(exchange, [this.id], {resolve})
                .subscribe(this.onClientRequestFromMaster);
        });
    }

    read(sqlQueryParts: SqlQueryParts) {

        let currentSuccessfulCounter = 0;
        let processingTimeCounter = 0;
        const selectings: Array<HRowSelecting> = [];

        if (sqlQueryParts.where) {
            SqlSyntaxService.instance
                .getAndsListFromWhere(sqlQueryParts.where)
                .forEach((ands: Array<Criteria>) => {

                    const usefulRowsKeys: Array<string> = [];
                    let comparator = null;

                    let skip = false;
                    for (let i = 0; i < ands.length && !skip; i++) {
                        const criteria = ands[i];

                        switch (criteria.operator) {
                            case SQL_OPERATOR_EQ:

                                const arrowKey = HRow.calcArrowKey(criteria);
                                const rowsKeys = this.rowsKeysByArrowKeyMap[arrowKey] || [];
                                if (rowsKeys.length) {
                                    GlobalCounter.up(GLOBAL_COUNTER_SQL_QUICK);
                                    usefulRowsKeys.push(...rowsKeys);
                                } else {
                                    GlobalCounter.up(GLOBAL_COUNTER_SQL_NORMAL);
                                    comparator = (a, b) => a == b;
                                }

                                break;

                            case SQL_OPERATOR_LT:
                                comparator = (a, b) => a < b;
                                break;

                            case SQL_OPERATOR_GT:
                                comparator = (a, b) => a > b;
                                break;

                            default:
                                throw new Error('Unexpected operator');
                        }

                        if (comparator) {
                            const {table, field, value} = criteria;

                            const rowsKeys = this
                                .filterRows(hRow => {

                                    processingTimeCounter++;

                                    return (
                                        hRow.tableName === table
                                        &&
                                        comparator(hRow.getValueByFieldName(field), value)
                                    );
                                })
                                .map(hRow => hRow.rowKey);

                            if (rowsKeys.length) {
                                usefulRowsKeys.push(...rowsKeys);
                            } else {
                                skip = true;
                            }
                        }
                    }

                    if (!skip) {

                        unique(usefulRowsKeys).forEach(rowKey => {
                            const regionId = this.regionIdByRowKeyMap[rowKey];
                            const usefulHRow = this.getRegionById(regionId).rows[rowKey];
                            if (usefulHRow) {
                                const selecting = usefulHRow.readBySelect(sqlQueryParts.select);
                                processingTimeCounter += selecting.processingTime;
                                selectings.push(selecting);
                                currentSuccessfulCounter++;

                            } else {
                                throw new Error('Запись есть в guide maps, но нет в регионе');
                            }
                        });
                    }
                });

        } else if (!sqlQueryParts.join){

            const tableName = sqlQueryParts.from[0];
            this
                .filterRows(hRow => {
                    processingTimeCounter++;
                    return hRow.tableName === tableName;
                })
                .map(usefulHRow => {
                    const selecting = usefulHRow.readBySelect(sqlQueryParts.select);
                    processingTimeCounter += selecting.processingTime;
                    selectings.push(selecting);
                    currentSuccessfulCounter++;
                });
        }

        this.successfulCounter += currentSuccessfulCounter;

        return {
            processingTime: processingTimeCounter,
            selectings,
            found: currentSuccessfulCounter
        };
    }

    private filterRows(criteriaFn: (hRow: HRow) => boolean): Array<HRow> {
        const result = [];

        this.regions.forEach(r => {
            const {rows} = r;
            for (let rowKey in rows) {
                const usefulHRow = rows[rowKey];
                if (criteriaFn(usefulHRow)) {
                    result.push(usefulHRow);
                }
            }
        });

        return result;
    }

    onClientRequestFromMaster = (request: ClientRequestFromMaster) => {

        const {sqlQueryParts, clientId, subKey} = request;
        const onMasterReply = request.onReply;

        console.log(`Регион сервер #${this.id} получил запрос клиента #${clientId}: ${sqlQueryParts.raw}`);

        this.requestsCounter++;

        this.calculateBehavior
            .calculate()
            .then(() => {
                console.log(`Регион сервер #${this.id} отправил мастеру ответ на запрос клиента #${clientId}`);
                onMasterReply({
                    subKey,
                    clientId,
                    slaveId: this.id,
                    requestsCounter: this.requestsCounter,
                    ...this.read(sqlQueryParts)
                });
            });
    };
}