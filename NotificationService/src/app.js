require('module-alias/register');
const express = require('express');
const amqp = require('amqplib');
const PaymentFailedListener = require('./infrastructure/PaymentFailedListener');
const TicketGeneratedListener = require('./infrastructure/TicketGeneratedListener');
const logger = require('@shared/logger/logger');
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

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

    const paymentFailedListener = new PaymentFailedListener(channel);
    const ticketGeneratedListener = new TicketGeneratedListener(channel);
    await paymentFailedListener.listen();
    await ticketGeneratedListener.listen();
    
    app.listen(3005, () => {
        logger.info('NotificationService is running on port 3005');
    });

    process.on('SIGINT', async () => {
        logger.info('Closing NotificationService...');
        await channel.close();
        await connection.close();
        process.exit(0);
    });
}

startApp().catch(error => {
    logger.error('Error starting NotificationService:', error);
    process.exit(1);
});
