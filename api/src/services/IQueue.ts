import {Observable} from "rxjs/Observable";
import {Promise} from 'es6-shim';

type ResponseType = 'sent' | 'received';

export interface PublishAndWaitResponse {
    type: ResponseType;
    data?: any;
    repeat?(data?);
}

export interface IQueue {
    publish(queueName: string, data: any): Promise<void>;
    consume(data: any, ...args): Observable<any>;
    destroy();

    acknowledge?(msg: string);
    publishAndWait?(queueName: string, data?: any): Observable<PublishAndWaitResponse>;
}