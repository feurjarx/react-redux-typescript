import * as amqp from 'amqplib/callback_api';

amqp.connect('amqp://localhost', function(err, conn) {
    conn.createChannel(function(err, ch) {
        const ex = 'direct_logs';

        ch.assertExchange(ex, 'direct', {durable: false});
        ch.assertQueue('', {exclusive: true}, function(err, q) {
            ch.bindQueue(q.queue, ex, 'severity');

            ch.prefetch(1);
            ch.consume(q.queue, function(msg) {

                ch.sendToQueue(
                    msg.properties.replyTo,
                    new Buffer('back'),
                    {
                        correlationId: msg.properties.correlationId
                    }
                );

                ch.ack(msg);
            }, {noAck: true});
        });
    });
});