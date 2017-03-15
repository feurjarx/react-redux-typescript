const amqp = require('amqplib/callback_api');

const queueName = 'test'

amqp.connect('amqp://localhost', (err, conn) => {
    if (err) {
        reject(err);
    } else {

        conn.createChannel((err, ch) => {
            if (err) {
                reject(err);
            } else {

                const durable = false;
                // const noAck = true;
                const noAck = false;

                ch.assertQueue(queueName, { durable });

                for (let i = 0; i < 10; i++) {
                    ch.sendToQueue(queueName, new Buffer('Hello'));
                }

                console.log('send client');

                setTimeout(() => conn.close(), 500);
            }
        });
    }
});