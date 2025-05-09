const { BaseListener } = require('@shared/events/BaseListener');
const PaymentRequestedHandler = require('../domain/handlers/PaymentRequestedHandler');
const PaymentRequestedCommand = require('../domain/commands/PaymentRequestedCommand');
const coreEvent = require('@shared/events/events/PaymentRequestedEvent');
const logger = require('@shared/logger/logger');

class PaymentRequestedListener extends BaseListener {
  constructor(channel, publisher, userResponseListener) {
    const handler = new PaymentRequestedHandler();
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
          const command = new PaymentRequestedCommand(
            event.payload.userEmail,
            event.payload.reservationId,
            event.payload.selectedPlaces,
            event.payload.sessionId
          );
          await this.handler.handle(command, this.publisher, this.userResponseListener);
        }
        this.channel.ack(msg);
      }
    });
  }
}

module.exports = PaymentRequestedListener;
