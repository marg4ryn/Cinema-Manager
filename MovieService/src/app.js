const amqp = require('amqplib');
const express = require('express');
const EventPublisher = require('./infrastructure/messaging/EventPublisher');
const EventListener = require('./infrastructure/messaging/EventListener');
const MovieQueryHandler = require('./domain/handlers/MovieQueryHandler');
const MovieCommandHandler = require('./domain/handlers/MovieCommandHandler');
const logger = require('./infrastructure/logging/logger');
const MOVIE_EVENTS = require('./domain/events/MovieEvents');
const RABBITMQ_URL = 'amqp://guest:guest@rabbitmq:5672';

const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb://mongo-movie:27017/movieservice'


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

    const publisher = new EventPublisher(channel, MOVIE_EVENTS.SESSIONS_SENT);

    const commandHandler = new MovieCommandHandler();
    await commandHandler.seedMovieSessions();

    const handler = new MovieQueryHandler(publisher, logger);

    const eventListener = new EventListener(channel, handler, logger);
    await eventListener.startListening(MOVIE_EVENTS.SESSIONS_REQUESTED);
    
    app.listen(3002, () => {
        logger.info('MovieService is running on port 3002');
    });

    process.on('SIGINT', async () => {
        logger.info('Closing MovieService...');
        await channel.close();
        await connection.close();
        process.exit(0);
    });
}

startApp().catch(error => {
    logger.error('Error starting MovieService:', error);
    process.exit(1);
});
