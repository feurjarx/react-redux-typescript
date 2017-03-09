import {CalculateBehavior} from './behaviors/CalculateBehavior';
import {Promise} from 'es6-shim';

export default class RandomSleepCalculating implements CalculateBehavior {
    dispersion: number;

    constructor(dispersion = 1000) {
        this.dispersion = dispersion;
    }

    calculate() {
        const sleep = Math.round(Math.random() * this.dispersion);
        return new Promise(resolve => setTimeout(() => resolve(), sleep));
    }
}