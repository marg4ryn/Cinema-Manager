const amqp = require('amqplib');
const express = require('express');
const EventListener = require('./infrastructure/messaging/EventListener');
const NotificationCommandHandler = require('./domain/handlers/NotificationCommandHandler');
const logger = require('./infrastructure/logging/logger');
const NOTIFICATION_EVENTS = require('./domain/events/NotificationEvents');
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';

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

    const notificationHandler = new NotificationCommandHandler();

    const handlerMap = {
        [NOTIFICATION_EVENTS.PAYMENT_FAILED]: notificationHandler,
        [NOTIFICATION_EVENTS.TICKET_GENERATED]: notificationHandler
    };

    const eventListener = new EventListener(channel, handlerMap, logger);
    await eventListener.startListening(NOTIFICATION_EVENTS.PAYMENT_FAILED);
    await eventListener.startListening(NOTIFICATION_EVENTS.TICKET_GENERATED);
    
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
