import {CalculateBehavior} from './CalculateBehavior';
import {Promise} from 'es6-shim';

export class RandomSleepCalculating implements CalculateBehavior {
    max: number;

    constructor(max = 1000) {
        this.max = max;
    }

    calculate(max = this.max) {
        const sleep = Math.round(Math.random() * max);
        return new Promise(resolve => setTimeout(() => (

            resolve({duration: sleep})

        ), sleep));
    }
}

export class SleepCalculating implements CalculateBehavior {
    sleep: number = 200;

    constructor(sleep?: number) {
        this.sleep = sleep;
    }

    calculate() {
        return new Promise(resolve => setTimeout(() => resolve(), this.sleep));
    }
}