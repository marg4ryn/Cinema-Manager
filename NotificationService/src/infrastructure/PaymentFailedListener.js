const { BaseListener } = require('@shared/events/BaseListener');
const PaymentFailedHandler = require('../domain/handlers/PaymentFailedHandler');
const SendPaymentFailedNotificationCommand = require('../domain/commands/SendPaymentFailedNotificationCommand');
const coreEvent = require('@shared/events/events/PaymentFailedEvent');
const logger = require('@shared/logger/logger');

class PaymentFailedListener extends BaseListener {
  constructor(channel) {
    const handler = new PaymentFailedHandler();
    super(channel, handler, logger, coreEvent);
  }

  async listen() {
    await this.channel.assertQueue(coreEvent.eventName, { durable: true });

    this.channel.consume(coreEvent.eventName, async (msg) => {
      if (msg !== null) {
        const event = JSON.parse(msg.content.toString());
        logger.info(`Received event: ${event.eventName}`)
        if (event.eventName === coreEvent.eventName) {
          const command = new SendPaymentFailedNotificationCommand(
            event.payload.userEmail,
            event.payload.reservationId
          );
          await this.handler.handle(command);
        }
        this.channel.ack(msg);
      }
    });
  }
}

module.exports = PaymentFailedListener;
