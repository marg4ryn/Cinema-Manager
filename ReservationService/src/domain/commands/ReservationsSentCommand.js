const Command = require('@shared/cqrs/Command');

class ReservationsSentCommand extends Command {
  constructor(sessionId, freeSeats, userEmail) {
    super();
    this.sessionId = sessionId;
    this.freeSeats = freeSeats;
    this.userEmail = userEmail;
  }
}

module.exports = ReservationsSentCommand;
