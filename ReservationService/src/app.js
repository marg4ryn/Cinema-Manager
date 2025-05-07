const amqp = require('amqplib');
const express = require('express');
const EventPublisher = require('./infrastructure/messaging/EventPublisher');
const EventListener = require('./infrastructure/messaging/EventListener');
const ReservationQueryHandler = require('./domain/handlers/ReservationQueryHandler');
const ReservationCommandHandler = require('./domain/handlers/ReservationCommandHandler');
const logger = require('./infrastructure/logging/logger');
const RESERVATION_EVENTS = require('./domain/events/ReservationEvents');
const RABBITMQ_URL = 'amqp://guest:guest@rabbitmq:5672';

const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb://mongo-movie:27019/reservationservice'


const app = express();

async function connectToMongoDB() {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        logger.info('Connected to MongoDB successfully');
    } catch (error) {
        logger.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}

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
    await connectToMongoDB();
    const { connection, channel } = await connectToRabbitMQ();

    const sessionPublisher = new EventPublisher(channel, RESERVATION_EVENTS.SESSIONS_REQUESTED);
    const paymentPublisher = new EventPublisher(channel, RESERVATION_EVENTS.PAYMENT_REQUESTED);

    const commandHandler = new ReservationCommandHandler();
    await commandHandler.seedMovieSessions();

    const queryHandler = new ReservationQueryHandler(commandHandler, logger);

    const sessionEventListener = new EventListener(channel, queryHandler, logger);
    await sessionEventListener.startListening(RESERVATION_EVENTS.SESSIONS_SENT);
    
    app.listen(3001, () => {
        logger.info('ReservationService is running on port 3001');
    });

    process.on('SIGINT', async () => {
        logger.info('Closing ReservationService...');
        await channel.close();
        await connection.close();
        process.exit(0);
    });
}

startApp().catch(error => {
    logger.error('Error starting ReservationService:', error);
    process.exit(1);
});
