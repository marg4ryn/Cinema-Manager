const logger = require('../logging/logger');
const { GENERATE_TICKET, SEND_TICKET } = require('../../domain/TicketEvents');
const TicketCommandHandler = require('../../application/TicketCommandHandler');

class EventListener {
    constructor(channel, publisher) {
        this.channel = channel;
        this.publisher = publisher;
        this.ticketCommandHandler = new TicketCommandHandler();
    }

    async listen() {
        const queue = GENERATE_TICKET;
        await this.channel.assertQueue(queue, { durable: true });

        this.channel.consume(queue, async (msg) => {
            if (msg !== null) {
                const event = JSON.parse(msg.content.toString());
                await this.handleGenerateTicketEvent(event);
                this.channel.ack(msg);
            }
        });
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
