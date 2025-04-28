const EventPublisher = require('../../infrastructure/events/EventPublisher');
const EventListener = require('../../infrastructure/events/EventListener');
const GenerateTicketCommandHandler = require('../../application/commands/GenerateTicketCommandHandler');
const { GENERATE_TICKET } = require('../../domain/events/TicketEvents');

async function setupTicketEvents(rabbitUrl) {
    const publisher = new EventPublisher(rabbitUrl);
    await publisher.connect();

    const listener = new EventListener(rabbitUrl);
    await listener.connect();

    const handler = new GenerateTicketCommandHandler(publisher);

    // Subskrypcja eventu "GenerateTicket"
    await listener.subscribe(GENERATE_TICKET, async (event) => {
        await handler.handle(event);
    });

    // Gdybyś chciał dodać inne eventy, np. `SendTicket`, subskrybujesz je tutaj
}

module.exports = { setupTicketEvents };
