const logger = require('../../infrastructure/logging/logger');

class NotificationCommandHandler {
    async handle(event) {
        switch (event.eventName) {
            case 'PaymentFailed':
                this.handlePaymentFailed(event);
                break;

            case 'TicketGenerated':
                this.handleTicketGenerated(event);
                break;

            default:
                logger.warn(`No handler implemented for event type: ${event.eventName}`);
        }
    }

    handlePaymentFailed(event) {
        logger.info(`[Notification] Failure message sent to email: ${event.payload.userEmail}`);
    }

    handleTicketGenerated(event) {
        logger.info(`[Notification] Ticket ${event.payload.ticket.ticketNumber} sent to email: ${event.payload.userEmail}`);
    }
}

module.exports = NotificationCommandHandler;
