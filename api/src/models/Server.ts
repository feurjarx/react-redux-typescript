import {IQueue} from "../services/IQueue";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs";

export default class Server {

    id: number;

    requestCounter: number = 0;

    provider: IQueue;

    subscriptions: Array<Subscription> = [];

    constructor(provider) {
        this.id = new Date().getTime();
        this.provider = provider;
    }

    listen(callback = null) {

        const observable = new Observable(observer => {

            const queueName = 'test';

            this.provider
                .consume(queueName)
                .subscribe(msg => {
                    console.log(`Server #${ this.id } received ${ msg.content.toString() }`);
                    observer.next();
                });
        });

        let subscription: Subscription;
        if (callback instanceof Function) {
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