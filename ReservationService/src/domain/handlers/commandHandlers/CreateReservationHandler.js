const Reservation = require('../../models/Reservation');
const EventPublisher = require('../../../infrastructure/messaging/EventPublisher');

class CreateReservationHandler {
  static async handle(command) {
    const reservation = new Reservation({
      userId: command.userId,
      movieId: command.movieId,
      seats: command.seats
    });

    await reservation.save();

    EventPublisher.publish('ReservationCreated', {
      reservationId: reservation._id,
      userId: reservation.userId,
      seats: reservation.seats
    });

    return reservation;
  }
}

module.exports = CreateReservationHandler;
