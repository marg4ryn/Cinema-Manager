const Reservation = require('../../domain/models/Reservation');

class ReservationRepository {
  static async create(reservationData) {
    const reservation = new Reservation(reservationData);
    return reservation.save();
  }

  static async findById(id) {
    return Reservation.findById(id);
  }
}

module.exports = ReservationRepository;
