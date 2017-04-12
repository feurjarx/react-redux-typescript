import {IQueue} from "../services/IQueue";
import {CalculateBehavior} from './servers/behaviors/calculate/CalculateBehavior';

export default class Server {

    id: any;

    requestCounter = 0;

    provider: IQueue;

    calculateBehavior: CalculateBehavior;

    constructor(provider = null) {
        this.id = new Date().getTime();

        if (provider) {
            this.provider = provider;
        }
    }

    close() {
        this.provider.destroy();
    }
}