import {Observable} from "rxjs/Observable";
import {Promise} from 'es6-shim';

export interface IQueue {
    publish(queueName: string, data: any): Promise<void>;
    consume(data: any): Observable<any>;
    destroy();
}