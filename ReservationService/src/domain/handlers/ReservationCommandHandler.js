const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');

class ReservationCommandHandler {
  constructor(eventPublisher, logger) {
    this.eventPublisher = eventPublisher;
    this.logger = logger;
  }

  async selectSeat(sessionId, userEmail, seatNumber) {
    try {
      const reservations = await Reservation.find({ sessionId }).lean();
      const reservedSeats = reservations.flatMap(r => r.seats);

      if (reservedSeats.includes(seatNumber)) {
        this.logger.warn(`Seat ${seatNumber} is already reserved.`);
        return;
      }

      await this.eventPublisher.publish({
        eventName: 'PaymentRequested',
        payload: {
          sessionId,
          userEmail,
          seatNumber
        }
      });

      this.logger.info(`Event PAYMENT_REQUESTED sent for seat ${seatNumber}, session ${sessionId}`);
    } catch (error) {
      this.logger.error('Error while selecting location:', error);
    }
  }

  async confirmReservation(sessionId, userEmail, seatNumber) {
    try {
      const reservation = new Reservation({
        sessionId,
        userEmail: userEmail,
        seats: [seatNumber]
      });

      await reservation.save();
      this.logger.info(`Saved reservation: seat ${seatNumber}, session ${sessionId}`);
    } catch (error) {
      this.logger.error('Error while saving reservation:', error);
    }
  }
}

module.exports = ReservationCommandHandler;
