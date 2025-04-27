const Reservation = require('../../models/Reservation');

class GetReservationHandler {
  static async handle(query) {
    return Reservation.findById(query.id);
  }
}

module.exports = GetReservationHandler;
