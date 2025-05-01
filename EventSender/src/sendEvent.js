const amqp = require('amqplib');
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';

async function sendEventToRabbitMQ(event) {
    try {
        console.log('Connecting to RabbitMQ...');
        const connection = await amqp.connect(RABBITMQ_URL);
        
        if (!connection) {
            throw new Error('Unable to establish a connection');
        }

        const channel = await connection.createChannel();

        const queue = event.eventName;

        console.log(`Asserting queue: ${queue}`);
        await channel.assertQueue(queue, { durable: true, exclusive: false, autoDelete: false });

        console.log(`Sending event to queue ${queue}`);
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(event)));

        console.log(`Event sent to ${queue}:`, event);

        await channel.close();
        await connection.close();
    } catch (error) {
        console.error('Error sending event:', error);
        console.error('Error stack:', error.stack);
    }
}

const ticketRequestedEvent = {
    eventName: 'TicketRequested',
    payload: {
        reservationId: '12345',
        userEmail: 'john.doe@gmail.com'
    }
};

const paymentFailedEvent = {
    eventName: 'PaymentFailed',
    payload: {
        reservationId: '12346',
        userEmail: 'john.doe2@gmail.com'
    }
};

sendEventToRabbitMQ(ticketRequestedEvent);
sendEventToRabbitMQ(paymentFailedEvent);
