import {IQueue} from "../services/IQueue";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs";
import {CalculateBehavior} from './servers/behaviors/CalculateBehavior';

export default class Server {

    id: any;

    requestCounter = 0;
    lastProcessingTime = 0;

    provider: IQueue;

    subscriptions: Array<Subscription> = [];

    calculateBehavior: CalculateBehavior;

    constructor(provider = null) {
        this.id = new Date().getTime();

        if (provider) {
            this.provider = provider;
        }
    }

    /**
     * @deprecated
     */
    listen(queueName, callback = Function(), lazy = true) {

        const observable = new Observable(observer => {

            this.provider
                .consume(queueName, { lazy })
                .subscribe(response => {

                    const body = JSON.parse(response.content.toString());

                    console.log(`Server #${ this.id } received ${ response }`);

                    const {requestTimeLimit} = body;

                    if (this.calculateBehavior) {
                        this.calculateBehavior
                            .calculate(requestTimeLimit)
                            .then(({ duration }) => {

                                this.requestCounter++;
                                this.lastProcessingTime = duration;

                                if (lazy) {
                                    this.provider.acknowledge(response);
                                }

                                observer.next(body);
                            });
                    }
                });
        });

        const subscription = observable.subscribe(callback.bind(this));
        this.subscriptions.push(subscription);
    }

    close() {
        this.provider.destroy();
        this.subscriptions.forEach(s => s.unsubscribe());
        this.subscriptions = [];
    }
}