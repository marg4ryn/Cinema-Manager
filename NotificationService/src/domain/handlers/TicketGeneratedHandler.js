const CommandHandler = require('@shared/cqrs/CommandHandler');
const logger = require('@shared/logger/logger');

class TicketGeneratedHandler extends CommandHandler {

  async handle(command) {
    const userEmail  = command.userEmail;
    const ticket  = command.ticket;
    logger.info(`Ticket ${ticket.ticketNumber} sent to ${userEmail}`);
  }
}

module.exports = TicketGeneratedHandler;
