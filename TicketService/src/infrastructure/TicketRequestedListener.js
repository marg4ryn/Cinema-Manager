const { BaseListener } = require('@shared/events/BaseListener');
const TicketRequestedHandler = require('../domain/handlers/TicketRequestedHandler');
const TicketRequestedCommand = require('../domain/commands/TicketRequestedCommand');
const coreEvent = require('@shared/events/events/TicketRequestedEvent');
const logger = require('@shared/logger/logger');

class TicketRequestedListener extends BaseListener {
  constructor(channel, publisher) {
    const handler = new TicketRequestedHandler();
    super(channel, handler, logger, coreEvent);
    this.publisher = publisher;
  }

  async listen() {
    await this.channel.assertQueue(coreEvent.eventName, { durable: true });

    this.channel.consume(coreEvent.eventName, async (msg) => {
      if (msg !== null) {
        const event = JSON.parse(msg.content.toString());
        logger.info(`Received event: ${event.eventName}`)
        if (event.eventName === coreEvent.eventName) {
          const command = new TicketRequestedCommand(
            event.payload.userEmail
          );
          await this.handler.handle(command, this.publisher);
        }
        this.channel.ack(msg);
      }
    });
  }
}

module.exports = TicketRequestedListener;
