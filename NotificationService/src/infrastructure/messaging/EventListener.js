const logger = require('../logging/logger');
const { CANCEL_RESERVATION, SEND_TICKET } = require('../../domain/NotificationEvents');
const NotificationCommandHandler = require('../../application/NotificationCommandHandler');

class EventListener {
    constructor(channel) {
        this.channel = channel;
        this.notificationCommandHandler = new NotificationCommandHandler();
    }

    async listen() {
        const cancelReservationQueue = CANCEL_RESERVATION;
        await this.channel.assertQueue(cancelReservationQueue, { durable: true });
        logger.info(`Listening for events on queue: ${cancelReservationQueue}`);

        this.channel.consume(cancelReservationQueue, async (msg) => {
            if (msg !== null) {
                const event = JSON.parse(msg.content.toString());
                await this.handleCancelReservationEvent(event);
                this.channel.ack(msg);
            }
        });

        const sendTicketQueue = SEND_TICKET;
        await this.channel.assertQueue(sendTicketQueue, { durable: true });
        logger.info(`Listening for events on queue: ${sendTicketQueue}`);

        this.channel.consume(sendTicketQueue, async (msg) => {
            if (msg !== null) {
                const event = JSON.parse(msg.content.toString());
                await this.handleSendTicketEvent(event);
                this.channel.ack(msg);
            }
        });
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
