import {random} from '../../../../helpers/index'
import SlaveSelectingBehavior from "./SlaveSelectingBehavior";

export class RandomSlaveSelecting implements SlaveSelectingBehavior {
    private static _instance;
    static get instance() {
        if (!this._instance) {
            this._instance = new RandomSlaveSelecting();
        }

        return this._instance;
    }

    getSlaveServerId(slaveServerIds: Array<any>) {
        return slaveServerIds[random(slaveServerIds.length - 1)];
    }
}