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
                const noAck = true;
                // const noAck = false;

                ch.assertQueue(queueName, { durable });

                ch.prefetch(1);
                ch.consume(queueName, msg => {

                    setTimeout(() => {


                        console.log('end')
                        // ch.ack(msg);

                    }, 2000);

                    console.log('consume server');

                }, { noAck });

            }
        });
    }
});