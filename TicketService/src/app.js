const express = require('express');
const EventPublisher = require('./infrastructure/messaging/EventPublisher');
const EventListener = require('./infrastructure/messaging/EventListener');
const logger = require('./infrastructure/logging/logger');
const amqp = require('amqplib');
const RABBITMQ_URL = 'amqp://myuser:mypassword@host.docker.internal:5672/';

// Tworzymy instancję aplikacji Express inst
const app = express();

// Funkcja uruchamiająca połączenie z RabbitMQ
async function connectToRabbitMQ() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        logger.info('Connected to RabbitMQ successfully');
        return { connection, channel };
    } catch (error) {
        logger.error('Failed to connect to RabbitMQ:', error);
        process.exit(1); // Przerwij aplikację, jeśli połączenie z RabbitMQ nie uda się nawiązać
    }
}

// Główna funkcja do uruchomienia serwisu
async function startApp() {
    const { connection, channel } = await connectToRabbitMQ();

    // Inicjalizacja publishera
    const publisher = new EventPublisher(channel);

    // Inicjalizacja listenera
    const eventListener = new EventListener(channel, publisher);
    await eventListener.listen();

    // Połączmy aplikację Express z RabbitMQ
    app.listen(3000, () => {
        logger.info('Server is running on port 3000');
    });

    // Obsługuje zamknięcie aplikacji (np. przez SIGINT, SIGTERM)
    process.on('SIGINT', async () => {
        logger.info('Closing application...');
        await channel.close();
        await connection.close();
        process.exit(0);
    });
}

// Uruchomienie aplikacji
startApp().catch(error => {
    logger.error('Error starting the application:', error);
    process.exit(1);
});
