const { BaseListener } = require('@shared/events/BaseListener');
const TicketGeneratedHandler = require('../domain/handlers/TicketGeneratedHandler');
const SendTicketGeneratedNotificationCommand = require('../domain/commands/SendTicketGeneratedNotificationCommand');
const coreEvent = require('@shared/events/events/TicketGeneratedEvent');
const logger = require('@shared/logger/logger');

class TicketGeneratedListener extends BaseListener {
  constructor(channel) {
    const handler = new TicketGeneratedHandler();
    super(channel, handler, logger, coreEvent);
  }

  async listen() {
    await this.channel.assertQueue(coreEvent.eventName, { durable: true });

    this.channel.consume(coreEvent.eventName, async (msg) => {
      if (msg !== null) {
        const event = JSON.parse(msg.content.toString());
        logger.info(`Received event: ${event.eventName}`)
        if (event.eventName === coreEvent.eventName) {
          const command = new SendTicketGeneratedNotificationCommand(
            event.payload.userEmail,
            event.payload.ticket
          );
          await this.handler.handle(command);
        }
        this.channel.ack(msg);
      }
    });
  }
}

module.exports = TicketGeneratedListener;
