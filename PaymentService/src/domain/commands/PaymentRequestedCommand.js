const Command = require('@shared/cqrs/Command');

class PaymentRequestedCommand extends Command {
  constructor(userEmail, reservationId) {
    super();
    this.reservationId = reservationId;
    this.userEmail = userEmail;
  }
}

module.exports = PaymentRequestedCommand;
