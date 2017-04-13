import {Observable} from "rxjs/Observable";
import {Promise} from 'es6-shim';

export interface IQueue {
    publish(queueName: string, data: any): Promise<void>;
    consume(data: any, ...args): Observable<any>;
    destroy();

    publishAndWait?(queueName: string, data?: any): Observable<any>;
    publishAndWaitByRouteKeys?(exchange: string, routeKeys: Array<string>, data?:any, options?: any): Observable<any>;
    consumeByRouteKeys?(exchange: string, routeKeys: Array<string>, ...options): Observable<any>;
}