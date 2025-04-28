const { v4: uuidv4 } = require('uuid'); // Do generowania losowego numeru ticketu
const logger = require('../../infrastructure/logger/logger');
const EventPublisher = require('../../infrastructure/events/EventPublisher');
const { SEND_TICKET } = require('../../domain/events/TicketEvents');

class GenerateTicketCommandHandler {
    constructor(publisher) {
        this.publisher = publisher;
    }

    async handle(event) {
        // Generowanie losowego numeru ticketu
        const ticketNumber = uuidv4();
        
        // Logowanie wygenerowanego ticketu
        logger.info(`Generated ticket number: ${ticketNumber} for the request`);

        // Wysyłanie eventu z danymi ticketu
        await this.publisher.publish({
            eventName: SEND_TICKET,
            payload: {
                ticketNumber
            }
        });
    }
}

module.exports = GenerateTicketCommandHandler;
