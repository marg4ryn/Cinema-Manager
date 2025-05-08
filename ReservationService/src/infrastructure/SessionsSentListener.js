const { BaseListener } = require('@shared/events/BaseListener');
const ReservationCommandHandler = require('../domain/handlers/ReservationCommandHandler');
const SessionsSentCommand = require('../domain/commands/SessionsSentCommand');
const coreEvent = require('@shared/events/events/SessionsSentEvent');
const logger = require('@shared/logger/logger');

class SessionsSentListener extends BaseListener {
  constructor(channel, publisher, userResponseListener) {
    const handler = new ReservationCommandHandler();
    super(channel, handler, logger, coreEvent);
    this.publisher = publisher;
    this.userResponseListener = userResponseListener;
  }

  async listen() {
    await this.channel.assertQueue(coreEvent.eventName, { durable: true });

    this.channel.consume(coreEvent.eventName, async (msg) => {
      if (msg !== null) {
        const event = JSON.parse(msg.content.toString());
        logger.info(`Received event: ${event.eventName}`)
        if (event.eventName === coreEvent.eventName) {
          const command = new SessionsSentCommand(event.payload.sessions);
          await this.handler.handle(command, this.publisher, this.userResponseListener);
        }
        this.channel.ack(msg);
      }
    });
  }
}

module.exports = SessionsSentListener;
