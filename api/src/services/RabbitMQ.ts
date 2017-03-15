import {IQueue, PublishAndWaitResponse} from "./IQueue";
import * as amqp from 'amqplib/callback_api';
import {Channel} from "amqplib/callback_api";
import {Message, Replies} from "amqplib";
import {Connection} from "amqplib/callback_api";
import {Observable} from 'rxjs/Observable';
import {Promise} from 'es6-shim';
import rabbitmqConfig from './../configs/rabbitmq';
import AssertQueue = Replies.AssertQueue;
const md5 = require('md5');

export default class RabbitMQ implements IQueue {

    private connection: Connection; // one Conn for one RabbitMQ !
    private channel: Channel; // one Channel for one RabbitMQ !

    private openConnection(): Promise<Connection> {

        if (this.connection) {
            this.destroy();
        }

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
            conn.createChannel((err, ch) => {
                if (err) {
                    reject(err);
                } else {
                    this.channel = ch;
                    resolve(ch);
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

    private publishAndWaitSender(queueName: string, tempQueueName: string, data) {

        const { correlationId } = data;

        this.channel.sendToQueue(queueName,
            new Buffer(JSON.stringify(data)), {
                correlationId,
                replyTo: tempQueueName
            }
        );
    }

    /**
     * Warning! Need call destroy after use
     */
    publishAndWait(queueName: string, data = {}): Observable<PublishAndWaitResponse> {

        return new Observable(observer => {
            this.connect()
                .then(ch => {

                    const exclusive = true;
                    const noAck = true;

                    ch.assertQueue('', { exclusive }, (err, queueTemp) => {

                        if (err) {

                            // todo: Observable throw exception ?

                        } else {

                            const correlationId = md5(Date.now());

                            const sendCall = this.publishAndWaitSender.bind(this, queueName, queueTemp.queue);

                            ch.consume(queueTemp.queue, response => {

                                if (response.properties.correlationId === correlationId) {

                                    observer.next({
                                        type: 'received',
                                        data: response,
                                        repeat: newData => {

                                            sendCall({
                                                correlationId,
                                                ...newData
                                            });

                                            observer.next({
                                                type: 'sent'
                                            });
                                        }
                                    });
                                }
                            });

                            sendCall({
                                correlationId,
                                ...data
                            });

                            observer.next({
                                type: 'sent'
                            });
                        }

                    }, { noAck })
                })
        })
    }

    publish(queueName: string, data = {}): Promise<void> {

        return new Promise((resolve, reject) => {

            // this.openConnection()
            this.connect()
                // .then(c => this.getChannelFromConnection(c))
                .then(ch => {
                    ch.assertQueue(queueName, {
                        durable: false
                    });

                    ch.sendToQueue(queueName, new Buffer(JSON.stringify(data)));

                    setTimeout(() => this.connection.close(), 500);

                    resolve();
                })
                .catch(err => reject(err))
        });
    }

    acknowledge(msg) {
        this.channel.ack(msg);
    }

    consume(queueName: string, { lazy = false }): Observable<Message> {

        return new Observable<Message>(observer => {

            this.connect()
                .then(ch => {

                    const durable = false;
                    ch.assertQueue(queueName, { durable });

                    let noAck = true;
                    if (lazy) {
                        noAck = false;
                        ch.prefetch(1);
                    }

                    ch.consume(queueName, msg => {

                        const { replyTo, correlationId } = msg.properties;
                        if (correlationId && replyTo) {

                            ch.sendToQueue(replyTo,
                                new Buffer('ok'),
                                {
                                    correlationId
                                }
                            );
                        }

                        observer.next(msg);

                    }, { noAck });
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