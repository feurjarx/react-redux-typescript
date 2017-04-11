import {random} from '../../../../helpers/index'
import SlaveSelectingBehavior from "./SlaveSelectingBehavior";
import {SqlParts} from "../../../../../typings/index";

export class RandomSlaveSelecting implements SlaveSelectingBehavior {
    private static _instance;
    static get instance() {
        if (!this._instance) {
            this._instance = new RandomSlaveSelecting();
        }

        return this._instance;
    }

    getSlaveServerId(slavesIds: Array<any>) {
        return slavesIds[random(slavesIds.length - 1)];
    }
}

export class TestSlaveSelecting implements SlaveSelectingBehavior {
    private static _instance;
    static get instance() {
        if (!this._instance) {
            this._instance = new RandomSlaveSelecting();
        }

        return this._instance;
    }

    sqls: Array<SqlParts>;

    getSlaveServerId(slavesIds: Array<any>) {
        return slavesIds[random(slavesIds.length - 1)];
    }
}