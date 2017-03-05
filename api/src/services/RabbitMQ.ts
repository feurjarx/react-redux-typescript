import {IQueue} from "./IQueue";
import * as amqp from 'amqplib/callback_api';
import {Channel} from "amqplib/callback_api";
import {Message} from "amqplib";
import {Connection} from "amqplib/callback_api";
import {Observable} from 'rxjs/Observable';

import rabbitmqConfig from './../configs/rabbitmq';

export default class RabbitMQ implements IQueue {

    private connection: Connection; // one Conn for one RabbitMQ !

    private openConnection(): Promise<Connection> {

        const {amqpUrl} = rabbitmqConfig;

        return new Promise<Connection>((resolve, reject) => {
            amqp.connect(amqpUrl, (err, conn) => {
                if (err) {
                    reject(err);
                } else {
                    this.connection = conn;
                    resolve(conn);
                }
            })
        })
    }

    private getChannelFromConnection(conn: Connection): Promise<Channel> {

        return new Promise((resolve, reject) => {
            conn.createChannel((err, channel) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(channel);
                }
            });
        });
    }

    private connect(): Promise<Channel> {

        return new Promise<Channel>((resolve, reject) => {
            this.openConnection()
                .then(conn => this.getChannelFromConnection(conn))
                .then(ch => resolve(ch))
                .catch(err => reject(err))
        });
    }

    publish(queueName: string, data: any): Promise<void> {

        return new Promise<void>((resolve, reject) => {

            this.openConnection()
                .then(c => this.getChannelFromConnection(c))
                .then(ch => {
                    ch.assertQueue(queueName, {
                        durable: false
                    });

                    ch.sendToQueue(queueName, new Buffer(data));

                    setTimeout(() => this.connection.close(), 500);

                    resolve();
                })
                .catch(err => reject(err))
        });
    }

    consume(queueName: string): Observable<Message> {

        return new Observable<Message>(observer => {

            debugger
            this.connect()
                .then(ch => {

                    ch.assertQueue(queueName, {
                        durable: false
                    });

                    ch.consume(queueName, msg => observer.next(msg), {
                        noAck: true
                    });
                })
                .catch(err => {
                    throw new Error('Connect invalid');
                });
        });
    }

    destroy() {
        return this.connection.close();
    }
}