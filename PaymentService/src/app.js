const express = require('express');
const axios = require('axios');
const amqp = require('amqplib');
const EventPublisher = require('./infrastructure/messaging/EventPublisher');
const EventListener = require('./infrastructure/messaging/EventListener');
const PaymentCommandHandler = require('./domain/handlers/PaymentCommandHandler');
const logger = require('./infrastructure/logging/logger');
const PAYMENT_EVENTS = require('./domain/events/PaymentEvents');
const paymentResponseRoutes = require('./api/payment-routes');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
const PORT = process.env.PORT || 3002;

const app = express();
app.use(express.json());

app.use('/', paymentResponseRoutes);

const paymentService = {
    async getUserResponse(reservationId) {
        const url = `http://localhost:${PORT}/payment-response/${reservationId}`;
        try {
            const response = await axios.get(url, { timeout: 30000 });
            if (response.data.status === 'yes') return 'approved';
            if (response.data.status === 'no') return 'declined';
            return null;
        } catch (error) {
            //logger.error(`Payment error for reservation ID: ${reservationId}`);
            return null;
        }
    }
};

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

    const publisher = new EventPublisher(channel);
    const handler = new PaymentCommandHandler(publisher, paymentService, logger);
    const eventListener = new EventListener(channel, handler, logger);

    await eventListener.startListening(PAYMENT_EVENTS.PAYMENT_REQUESTED);

    app.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
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
