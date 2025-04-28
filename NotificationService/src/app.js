// src/app.js

const NotificationService = require('./application/NotificationService');
const logger = require('./infrastructure/logger/logger');

const start = async () => {
    try {
        const notificationService = new NotificationService('amqp://localhost');
        await notificationService.start();

        // Obsługuje zamknięcie aplikacji (opcjonalnie)
        process.on('SIGINT', async () => {
            console.log('Shutting down...');
            await notificationService.close();
            logger.info('NotificationService stopped successfully.');
            process.exit(0);
        });

    } catch (error) {
        console.error(error);
        logger.error(error.message);
        process.exit(1);
    }
};

start();
