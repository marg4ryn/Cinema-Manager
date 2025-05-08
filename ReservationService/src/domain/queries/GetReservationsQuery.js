const Query = require('@shared/cqrs/Query');

class GetReservationsQuery extends Query {
  constructor(sessionId, totalSeats) {
    super();
    this.sessionId = sessionId;
    this.totalSeats = totalSeats;
  }
}

module.exports = GetReservationsQuery;
