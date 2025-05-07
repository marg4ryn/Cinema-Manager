class Query {
    constructor() {
      if (new.target === Query) {
        throw new Error('Query is an abstract class.');
      }
    }
  }
  
  module.exports = Query;
  