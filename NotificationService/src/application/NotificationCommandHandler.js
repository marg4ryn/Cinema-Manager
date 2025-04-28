// src/application/NotificationCommandHandler.js
const logger = require('../infrastructure/logging/logger');

class NotificationCommandHandler {
    // Obsługuje event anulowania rezerwacji
    async handleCancelReservation(event) {
        logger.info(`Handling Cancel Reservation event: ${event.eventName}`);
        logger.info(`Reservation ID: ${event.payload.reservationId} has been canceled`);
        // Możesz tu dodać logikę, np. wysyłanie e-maila o anulowanej rezerwacji.
    }

    // Obsługuje event wysyłania biletu
    async handleSendTicket(event) {
        logger.info(`Handling Send Ticket event: ${event.eventName}`);
        logger.info(`Ticket Number: ${event.payload.ticketNumber} is ready to be sent.`);
        // Możesz tu dodać logikę, np. wysyłanie powiadomienia o bilecie.
    }
}

module.exports = NotificationCommandHandler;
