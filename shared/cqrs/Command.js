class Command {
    constructor() {
      if (new.target === Command) {
        throw new Error('Command is an abstract class.');
      }
    }
  }
  
  module.exports = Command;
  