const { v4: uuidv4 } = require('uuid');
const logger = require('../infrastructure/logging/logger');

class TicketCommandHandler {
    generate() {
        const ticketNumber = uuidv4();
        logger.info(`Generated ticket number: ${ticketNumber}`);

        return ticketNumber;
    }
}

module.exports = TicketCommandHandler;
