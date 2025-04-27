// src/domain/events/reservationCreatedEvent.js
class ReservationCreatedEvent {
    constructor(reservation) {
      this.type = 'ReservationCreated';
      this.reservation = reservation;
    }
  }
  
  module.exports = { ReservationCreatedEvent };
  