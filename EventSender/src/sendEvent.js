const amqp = require('amqplib');
const RABBITMQ_URL = 'amqp://guest:guest@localhost:5672';

async function sendEventToRabbitMQ(event) {
    try {
        console.log('Connecting to RabbitMQ...');
        const connection = await amqp.connect(RABBITMQ_URL);
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
    }
}

const exampleEvent = {
    eventName: 'GENERATE_TICKET'
};

sendEventToRabbitMQ(exampleEvent);
