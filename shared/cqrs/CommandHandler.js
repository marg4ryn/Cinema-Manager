class CommandHandler {
    constructor() {
      if (new.target === CommandHandler) {
        throw new Error('CommandHandler is an abstract class.');
      }
    }
  
    async execute(command) {
      throw new Error('execute(command) must be implemented');
    }
  }
  
  module.exports = CommandHandler;
  