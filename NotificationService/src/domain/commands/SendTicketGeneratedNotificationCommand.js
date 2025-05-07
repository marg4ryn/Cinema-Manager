const Command = require('@shared/cqrs/Command');

class SendTicketGeneratedNotificationCommand extends Command {
  constructor(userEmail, ticket) {
    super();
    this.userEmail = userEmail;
    this.ticket = ticket;
  }
}

module.exports = SendTicketGeneratedNotificationCommand;
