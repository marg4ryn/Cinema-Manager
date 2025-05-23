const { BaseListener } = require('@shared/events/BaseListener');
const PaymentSucceededCommand = require('../domain/commands/PaymentSucceededCommand');
const ReservationCommandHandler = require('../domain/handlers/ReservationCommandHandler');
const coreEvent = require('@shared/events/events/PaymentSucceededEvent');
const logger = require('@shared/logger/logger');

class PaymentSucceededListener extends BaseListener {
  constructor(channel, publisher) {
    const handler = new ReservationCommandHandler();
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
          const command = new PaymentSucceededCommand(event.payload.reservationId, event.payload.userEmail, event.payload.selectedPlaces, event.payload.sessionId);
          await this.handler.handle(command, this.publisher);
        }
        this.channel.ack(msg);
      }
    });
  }
}

module.exports = PaymentSucceededListener;
