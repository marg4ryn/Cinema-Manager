const Command = require('@shared/cqrs/Command');

class SessionsSentCommand extends Command {
  constructor(sessions) {
    super();
    this.sessions = sessions;
  }
}

module.exports = SessionsSentCommand;
