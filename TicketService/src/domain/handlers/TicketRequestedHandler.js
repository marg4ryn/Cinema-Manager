const { v4: uuidv4 } = require('uuid');
const CommandHandler = require('@shared/cqrs/CommandHandler');
const TicketGeneratedEvent = require('@shared/events/events/TicketGeneratedEvent');
const logger = require('@shared/logger/logger');

class TicketRequestedHandler extends CommandHandler {

  async handle(command, publisher) {
    const ticket = {
        ticketNumber: uuidv4(),
        userEmail: command.userEmail,
        createdAt: new Date().toISOString()
    };

    const event = new TicketGeneratedEvent(command.userEmail, ticket);
    publisher.publish(event)

    logger.info(`Ticket ${ticket.ticketNumber} for user ${ticket.userEmail} sent to queue.`);
  }
}

module.exports = TicketRequestedHandler;
