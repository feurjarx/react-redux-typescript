import {CalculateBehavior} from './behaviors/CalculateBehavior';
import {Promise} from 'es6-shim';

export default class SleepCalculating implements CalculateBehavior {
    sleep: number = 200;

    constructor(sleep?: number) {
        this.sleep = sleep;
    }

    calculate() {
        return new Promise(resolve => setTimeout(() => resolve(), this.sleep));
    }
}