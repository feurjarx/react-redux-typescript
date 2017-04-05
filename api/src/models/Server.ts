import {IQueue} from "../services/IQueue";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs";
import rabbitmqConfig from "./../configs/rabbitmq";
import {CalculateBehavior} from './servers/behaviors/CalculateBehavior';

export default class Server {

    id: any;

    requestCounter = 0;
    processingTimeCounter = 0;
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

    listen(callback = null) {

        const observable = new Observable(observer => {

            const { queueName } = rabbitmqConfig;

            const lazy = true;

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
                                this.processingTimeCounter += duration;
                                this.lastProcessingTime = duration;

                                if (lazy) {
                                    this.provider.acknowledge(response);
                                }

                                observer.next(body);
                            });
                    }
                });
        });

        let subscription: Subscription;
        if (callback instanceof Function) {
            callback = callback.bind(this);
            subscription = observable.subscribe(callback);
        } else {
            subscription = observable.subscribe();
        }

        this.subscriptions.push(subscription);
    }

    close() {
        this.provider.destroy();
        this.subscriptions.forEach(s => s.unsubscribe());
        this.subscriptions = [];
    }
}