const logger = require('../infrastructure/logging/logger');

class NotificationCommandHandler {
    async handleCancelReservation(event) {
        logger.info(`Handling Cancel Reservation event: ${event.eventName}`);
        logger.info(`Reservation ID: ${event.payload.reservationId} has been canceled`);
    }

    async handleSendTicket(event) {
        logger.info(`Handling Send Ticket event: ${event.eventName}`);
        logger.info(`Ticket Number: ${event.payload.ticketNumber} is ready to be sent.`);
    }
}

module.exports = NotificationCommandHandler;
