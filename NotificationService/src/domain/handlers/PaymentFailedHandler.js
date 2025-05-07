const CommandHandler = require('@shared/cqrs/CommandHandler');
const logger = require('@shared/logger/logger');

class PaymentFailedHandler extends CommandHandler {

  async handle(command) {
    const userEmail  = command.userEmail;
    const reservationId  = command.reservationId;
    logger.info(`Payment failure message sent to ${userEmail} for reservation ${reservationId}`);
  }
}

module.exports = PaymentFailedHandler;
