import ShardingBehavior from "./ShardingBehavior";
import HRow from "../../../HRow";
import {random} from '../../../../helpers/index'

export class VerticalSharding implements ShardingBehavior {
    private static _instance;
    static get instance() {
        if (!this._instance) {
            this._instance = new VerticalSharding();
        }

        return this._instance;
    }

    title = 'vertical';
    repeated = false;
    getSlaveServerId(hRow, slaveServersIds, {serverId}) {
        return serverId;
    }
}

export class HorizontalSharding implements ShardingBehavior {
    private static _instance;
    static get instance() {
        if (!this._instance) {
            this._instance = new HorizontalSharding();
        }

        return this._instance;
    }

    title = 'horizontal';
    repeated = true;

    getSlaveServerId(hRow: HRow, slaveServersIds: Array<any>, {fieldId, attemptCounter = 0}) {
        let idx = (hRow.getValueByFieldName(fieldId) + attemptCounter)% slaveServersIds.length;
        return slaveServersIds[idx];
    }
}

export class RandomSharding implements ShardingBehavior {
    private static _instance;
    static get instance() {
        if (!this._instance) {
            this._instance = new RandomSharding();
        }

        return this._instance;
    }

    repeated = true;
    getSlaveServerId(_, slaveServerIds: Array<any>) {
        return slaveServerIds[random(slaveServerIds.length - 1)];
    }
}