const Command = require('@shared/cqrs/Command');

class SeedSessionsCommand extends Command {
  constructor() {
    super();
  }
}

module.exports = SeedSessionsCommand;
