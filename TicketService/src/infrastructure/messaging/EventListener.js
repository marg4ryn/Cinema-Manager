const logger = require('../logging/logger');
const { GENERATE_TICKET, SEND_TICKET } = require('../../domain/TicketEvents');
const TicketCommandHandler = require('../../application/TicketCommandHandler');

class EventListener {
    constructor(publisher) {
        this.publisher = publisher;
        this.ticketCommandHandler = new TicketCommandHandler();
    }

    async listen() {
        await this.publisher.subscribe(GENERATE_TICKET, this.handleGenerateTicketEvent.bind(this));
    }

    async handleGenerateTicketEvent(event) {
        logger.info(`Received event: ${event.eventName}`);
        const ticketNumber = this.ticketCommandHandler.generate();

        await this.publisher.publish({
            eventName: SEND_TICKET,
            payload: {
                ticketNumber
            }
        });
    }
}

module.exports = EventListener;
