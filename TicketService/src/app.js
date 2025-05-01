const express = require('express');
const amqp = require('amqplib');
const EventPublisher = require('./infrastructure/messaging/EventPublisher');
const EventListener = require('./infrastructure/messaging/EventListener');
const GenerateTicketHandler = require('./domain/handlers/GenerateTicketHandler');
const TICKET_EVENTS = require('./domain/events/TicketEvents');
const logger = require('./infrastructure/logging/logger');
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

    const publisher = new EventPublisher(channel, TICKET_EVENTS.TICKET_GENERATED);

    const handlerMap = {
        [TICKET_EVENTS.TICKET_REQUESTED]: new GenerateTicketHandler(publisher, logger),
    };

    const eventListener = new EventListener(channel, handlerMap, logger);
    await eventListener.startListening(TICKET_EVENTS.TICKET_REQUESTED);

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
