// src/application/NotificationHandler.js

const logger = require('../infrastructure/logger/logger');

class NotificationHandler {

    // Generyczny handler do obsługi eventów
    async handleEvent(event) {
        switch (event.eventName) {
            case 'CancelReservation':
                logger.info(`Received CancelReservation event: ${JSON.stringify(event)}`);
                break;

            case 'SendTicket':
                logger.info(`Received SendTicket event: ${JSON.stringify(event)}`);
                break;

            default:
                logger.warn(`Unknown event received: ${JSON.stringify(event)}`);
        }
    }
}

module.exports = NotificationHandler;
