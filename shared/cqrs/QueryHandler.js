class QueryHandler {
    constructor() {
      if (new.target === QueryHandler) {
        throw new Error('QueryHandler is an abstract class.');
      }
    }
  
    async execute(query) {
      throw new Error('execute(query) must be implemented');
    }
  }
  
  module.exports = QueryHandler;
  