const { v4: uuidv4 } = require('uuid');
const TICKET_EVENTS = require('../events/TicketEvents');

class GenerateTicketHandler {
    constructor(eventPublisher, logger) {
        this.eventPublisher = eventPublisher;
        this.logger = logger;
    }

    async handle(event) {
        this.logger.info(`Generating ticket for reservation ${event.payload.reservationId}`);

        const ticket = {
            ticketNumber: uuidv4(),
            createdAt: new Date().toISOString()
        };

        await this.eventPublisher.publish({
            eventName: TICKET_EVENTS.TICKET_GENERATED,
            payload: {
                reservationId: event.payload.reservationId,
                userEmail: event.payload.userEmail,
                ticket: ticket
            }
        });

        this.logger.info(`Ticket ${ticket.ticketNumber} for reservation ${event.payload.reservationId} sent to queue.`);
    }
}

module.exports = GenerateTicketHandler;
