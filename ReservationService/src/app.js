require('module-alias/register');
const express = require('express');
const amqp = require('amqplib');
const SessionsRequestedEvent = require('@shared/events/events/SessionsRequestedEvent');
const SessionsSentListener = require('./infrastructure/SessionsSentListener');
const HttpUserResponseListener = require('./api/HttpUserResponseListener');
const PaymentSucceededListener = require('./infrastructure/PaymentSucceededListener');
const Publisher = require('@shared/events/EventPublisher');
const logger = require('@shared/logger/logger');
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/reservationservice';

const app = express();
app.use(express.json()); 

async function connectToMongoDB() {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        logger.info('Connected to MongoDB successfully');
    } catch (error) {
        logger.error('MongoDB connection failed. Retrying in 5s...', error);
        setTimeout(connectToMongoDB, 5000);
    }
}

async function connectToRabbitMQ() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        logger.info('Connected to RabbitMQ successfully');
        return { connection, channel };
    } catch (error) {
        logger.error('RabbitMQ connection failed. Retrying in 5s...', error);
        setTimeout(connectToRabbitMQ, 5000);
    }
}

async function startApp() {
    await connectToMongoDB();

    const { connection, channel } = await connectToRabbitMQ();

    const listener = new HttpUserResponseListener();
    const publisher = new Publisher(channel, logger);

    require('./api/userResponse')(app, publisher, listener);

    const sessionsSentListener = new SessionsSentListener(channel, publisher, listener);
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
