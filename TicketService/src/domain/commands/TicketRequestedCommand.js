const Command = require('@shared/cqrs/Command');

class TicketRequestedCommand extends Command {
  constructor(userEmail) {
    super();
    this.userEmail = userEmail;
  }
}

module.exports = TicketRequestedCommand;
