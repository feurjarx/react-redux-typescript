import {Message} from "amqplib";
import {Observable} from "rxjs/Observable";
export interface IQueue {
    publish(queueName: string, data: any): Promise<void>;
    consume(data: any): Observable<Message>;
    destroy();
}