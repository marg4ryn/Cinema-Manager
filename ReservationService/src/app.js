require('module-alias/register');
const express = require('express');
const amqp = require('amqplib');
const SessionsRequestedEvent = require('@shared/events/events/SessionsRequestedEvent');
const SessionsSentListener = require('./infrastructure/SessionsSentListener');
const PaymentSucceededListener = require('./infrastructure/PaymentSucceededListener');
const Publisher = require('@shared/events/EventPublisher');
const logger = require('@shared/logger/logger');
const RABBITMQ_URL = 'amqp://guest:guest@rabbitmq:5672';
const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb://mongo-movie:27017/movieservice'

const app = express();

async function connectToMongoDB() {
    try {
        mongoose.set('strictQuery', false);
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

    const publisher = new Publisher(channel, logger);

    const sessionsSentListener = new SessionsSentListener(channel, publisher);
    await sessionsSentListener.listen();

    const paymentSucceededListener = new PaymentSucceededListener(channel, publisher);
    await paymentSucceededListener.listen();

    app.listen(3001, () => {
        logger.info('ReservationService is running on port 3001');
    });

    const sessionsRequestedEvent = new SessionsRequestedEvent();
    publisher.publish(sessionsRequestedEvent);
    logger.info('Sessions data requested.')

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
