// src/app.js

const PaymentService = require('./application/PaymentService');
const logger = require('./infrastructure/logger/logger');

const RABBITMQ_URL = 'amqp://localhost'; // Adres RabbitMQ (dostosuj w zależności od konfiguracji)

async function start() {
    const paymentService = new PaymentService(RABBITMQ_URL);

    try {
        // Uruchomienie PaymentService, który nasłuchuje na eventy
        await paymentService.start();
        logger.info('PaymentService is running and listening for events...');
    } catch (error) {
        logger.error('Error starting PaymentService:', error);
    }
}

start().catch(error => {
    logger.error('Error in application start:', error);
});
