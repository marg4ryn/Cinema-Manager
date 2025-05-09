const Command = require('@shared/cqrs/Command');

class PaymentRequestedCommand extends Command {
  constructor(userEmail, reservationId, selectedPlaces, sessionId) {
    super();
    this.reservationId = reservationId;
    this.userEmail = userEmail;
    this.selectedPlaces = selectedPlaces;
    this.sessionId = sessionId;
  }
}

module.exports = PaymentRequestedCommand;
