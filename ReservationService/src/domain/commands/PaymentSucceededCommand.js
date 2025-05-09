const Command = require('@shared/cqrs/Command');

class PaymentSucceededCommand extends Command {
  constructor(reservationId, userEmail, selectedPlaces, sessionId) {
    super();
      this.reservationId = reservationId;
      this.userEmail = userEmail;
      this.selectedPlaces = selectedPlaces;
      this.sessionId = sessionId;
  }
}

module.exports = PaymentSucceededCommand;
