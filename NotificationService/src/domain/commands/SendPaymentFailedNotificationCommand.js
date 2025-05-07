const Command = require('@shared/cqrs/Command');

class SendPaymentFailedNotificationCommand extends Command {
  constructor(userEmail, reservationId) {
    super();
    this.userEmail = userEmail;
    this.reservationId = reservationId;
  }
}

module.exports = SendPaymentFailedNotificationCommand;
