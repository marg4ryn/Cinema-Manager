require('module-alias/register');
const bodyParser = require('body-parser');
const express = require('express');
const amqp = require('amqplib');
const PaymentRequestedListener = require('./infrastructure/PaymentRequestedListener');
const HttpUserResponseListener = require('./api/HttpUserResponseListener');
const Publisher = require('@shared/events/EventPublisher');
const logger = require('@shared/logger/logger');
const RABBITMQ_URL = 'amqp://guest:guest@rabbitmq:5672';

const app = express();
app.use(bodyParser.json());

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
    const listener = new HttpUserResponseListener();

    require('./api/userResponse')(app, listener);

    const publisher = new Publisher(channel, logger);

    const paymentRequestedListener = new PaymentRequestedListener(channel, publisher, listener);
    await paymentRequestedListener.listen();

    app.listen(3003, () => {
        logger.info(`Server is running on port 3003`);
    });

    process.on('SIGINT', async () => {
        logger.info('Shutting down...');
        await channel.close();
        await connection.close();
        process.exit(0);
    });
}

startApp().catch(error => {
    logger.error('Error starting the application:', error);
    process.exit(1);
});
