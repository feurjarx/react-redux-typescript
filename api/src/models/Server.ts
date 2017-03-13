import {IQueue} from "../services/IQueue";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs";
import rabbitmqConfig from "./../configs/rabbitmq";
import {CalculateBehavior} from './servers/behaviors/CalculateBehavior'

export default class Server {

    id: number;

    requestCounter: number = 0;

    provider: IQueue;

    subscriptions: Array<Subscription> = [];

    calculateBehavior: CalculateBehavior;

    constructor(provider) {
        this.id = new Date().getTime();
        this.provider = provider;
    }

    listen(callback = null) {

        const observable = new Observable(observer => {

            const { queueName } = rabbitmqConfig;

            this.provider
                .consume(queueName)
                .subscribe(response => {

                    response = JSON.parse(response.content.toString());

                    console.log(`Server #${ this.id } received ${ JSON.stringify(response, null, 2) }`);

                    const {requestTimeLimit} = response;

                    if (this.calculateBehavior) {
                        this.calculateBehavior
                            .calculate(requestTimeLimit)
                            .then(() => {
                                this.requestCounter++;
                                observer.next(response);
                            });

                    } else {

                        this.requestCounter++;
                        observer.next(response);
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