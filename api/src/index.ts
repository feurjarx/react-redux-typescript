import * as ioServer from 'socket.io';
import * as http from 'http';
import * as amqp from 'amqplib/callback_api';

import {
    EVENT_IO_LIFE,
    EVENT_IO_CONNECTION,
    EVENT_IO_DISCONNECT

} from './constants/events';

const socketPort = 3003;

function life(data) {
    console.log('client data: ');
    console.log(data);

    amqp.connect('amqp://localhost', (err, conn) => {
        conn.createChannel((err, channel) => {

            const queueName = 'test';

            channel.assertQueue(queueName, {
                durable: false
            });

            channel.sendToQueue(queueName, new Buffer('Hello world'));

            console.log('i send');

            setTimeout(() => conn.close(), 500);
        })
    });

    amqp.connect('amqp://localhost', (err, conn) => {

        conn.createChannel((err, channel) => {

            const queueName = 'test';
            channel.assertQueue(queueName, {
                durable: false
            });

            channel.consume(queueName, (msg) => {
                console.log(" [!] Received %s", msg.content.toString());
            }, {noAck: true});
        });
    });
}

function disconnect() {
    console.log('client was disconnected.');
}

export const run = () => {

    const httpServer = http.createServer();
    const io = ioServer(httpServer);

    io.on(EVENT_IO_CONNECTION, client => {

        console.log('client connected.');

        client.on(EVENT_IO_LIFE, life);
        client.on(EVENT_IO_DISCONNECT, disconnect);
    });

    httpServer.listen(socketPort);
};

run();