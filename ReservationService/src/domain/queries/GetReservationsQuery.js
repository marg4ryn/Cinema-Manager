const Query = require('@shared/cqrs/Query');

class GetReservationsQuery extends Query {
  constructor(sessionId, totalSeats, userEmail) {
    super();
    this.sessionId = sessionId;
    this.totalSeats = totalSeats;
    this.userEmail = userEmail;
  }
}

module.exports = GetReservationsQuery;
