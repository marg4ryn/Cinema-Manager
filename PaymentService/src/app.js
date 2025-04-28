const express = require('express');
const EventPublisher = require('./infrastructure/messaging/EventPublisher');
const EventListener = require('./infrastructure/messaging/EventListener');
const logger = require('./infrastructure/logging/logger');
const amqp = require('amqplib');
const RABBITMQ_URL = 'amqp://guest:guest@localhost:5672';

const app = express();

async function connectToRabbitMQ() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        logger.info('Connected to RabbitMQ successfully');
        return { connection, channel };
    } catch (error) {
        logger.error('Failed to connect to RabbitMQ:', error);
        process.exit(1);
    }
}

async function startApp() {
    const { connection, channel } = await connectToRabbitMQ();

    const publisher = new EventPublisher(channel);
    await publisher.connect();
    
    const eventListener = new EventListener(channel, publisher);
    await eventListener.listen();

    app.listen(3000, () => {
        logger.info('Server is running on port 3000');
    });

    process.on('SIGINT', async () => {
        logger.info('Closing application...');
        await channel.close();
        await connection.close();
        process.exit(0);
    });
}

startApp().catch(error => {
    logger.error('Error starting the application:', error);
    process.exit(1);
});
