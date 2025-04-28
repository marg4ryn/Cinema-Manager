const logger = require('../logging/logger');
const NotificationCommandHandler = require('../../application/NotificationCommandHandler');
const { CANCEL_RESERVATION, SEND_TICKET } = require('../../domain/NotificationEvents');

class EventListener {
    constructor(publisher) {
        this.publisher = publisher;
        this.notificationCommandHandler = new NotificationCommandHandler();
    }

    async listen() {
        await this.publisher.subscribe(CANCEL_RESERVATION, this.handleCancelReservationEvent.bind(this));
        await this.publisher.subscribe(SEND_TICKET, this.handleSendTicketEvent.bind(this));
    }

    async handleCancelReservationEvent(event) {
        logger.info(`Received event: ${event.eventName}`);
        await this.notificationCommandHandler.handleCancelReservation(event);
    }

    async handleSendTicketEvent(event) {
        logger.info(`Received event: ${event.eventName}`);
        await this.notificationCommandHandler.handleSendTicket(event);
    }
}

module.exports = EventListener;
