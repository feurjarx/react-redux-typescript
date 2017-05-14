import {IQueue} from "../services/IQueue";
import {CalculateBehavior} from './servers/behaviors/calculate/CalculateBehavior';
import {random} from "../helpers/index";
import {fail} from "assert";

export default class Server {

    id: any;

    requestsCounter = 0;

    pDie: number;
    replicationNumber: number;

    failedCounter: number;

    provider: IQueue;

    calculateBehavior: CalculateBehavior;

    constructor(provider = null, serverData) {
        this.id = new Date().getTime();

        if (provider) {
            this.provider = provider;
        }

        this.pDie = serverData.pDie || 0;
        this.replicationNumber = serverData.replicationNumber || 0;
        this.failedCounter = 0;
    }

    close() {
        this.provider.destroy();
    }

    hasFailed() {

        let failed = false;
        if (this.pDie) {

            let replicationsCounter = this.replicationNumber + 1;
            do {

                const diff = (this.replicationNumber + 1) - replicationsCounter;
                failed = random(100) <= (this.pDie / 10**diff);
                failed && this.failedCounter++;
                replicationsCounter--;

            } while (failed && replicationsCounter);
        }

        return failed;
    }
}