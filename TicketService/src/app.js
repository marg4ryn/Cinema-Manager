require('module-alias/register');
const express = require('express');
const amqp = require('amqplib');
const TicketRequestedListener = require('./infrastructure/TicketRequestedListener');
const Publisher = require('@shared/events/EventPublisher');
const logger = require('@shared/logger/logger');
const RABBITMQ_URL = 'amqp://guest:guest@rabbitmq:5672';

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

    const ticketGeneratedPublisher = new Publisher(channel, logger);
    const ticketRequestedListener = new TicketRequestedListener(channel, ticketGeneratedPublisher);
    await ticketRequestedListener.listen();

    app.listen(3004, () => {
        logger.info('TicketService is running on port 3004');
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
