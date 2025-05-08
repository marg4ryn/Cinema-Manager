const Query = require('@shared/cqrs/Query');

class GetSessionsQuery extends Query {
  constructor() {
    super();
  }
}

module.exports = GetSessionsQuery;
