import ShardingBehavior from "./ShardingBehavior";
import HRow from "../../../HRow";
import {random, str2numbers} from '../../../../helpers/index'

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
    getSlaveServerId(hRow, slavesIds, {serverId}) {
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

    getSlaveServerId(hRow: HRow, slavesIds: Array<any>, {fieldName, attemptCounter = 0}) {
        fieldName = fieldName || 'id';
        let value = hRow.getValueByFieldName(fieldName);

        if (typeof value  === 'string') {
            value = str2numbers(value);
        }

        let idx = (value + attemptCounter) % slavesIds.length;
        return slavesIds[idx];
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
    getSlaveServerId(_, slavesIds: Array<any>) {
        return slavesIds[random(slavesIds.length - 1)];
    }
}