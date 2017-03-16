import {CalculateBehavior} from './behaviors/CalculateBehavior';
import {Promise} from 'es6-shim';

export default class RandomSleepCalculating implements CalculateBehavior {
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