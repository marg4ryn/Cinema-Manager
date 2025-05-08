require('module-alias/register');
const express = require('express');
const amqp = require('amqplib');
const SessionsRequestedListener = require('./infrastructure/SessionsRequestedListener');
const MovieCommandHandler = require('./domain/handlers/MovieCommandHandler');
const SeedSessionsCommand = require('./domain/commands/SeedSessionsCommand');
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

    const seedSessionsCommand = new SeedSessionsCommand();
    const commandHandler = new MovieCommandHandler();
    await commandHandler.seedMovieSessions(seedSessionsCommand);

    const { connection, channel } = await connectToRabbitMQ();

    const publisher = new Publisher(channel, logger);

    const sessionsRequestedListener = new SessionsRequestedListener(channel, publisher);
    await sessionsRequestedListener.listen();

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
