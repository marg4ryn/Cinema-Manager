// src/domain/usecases/createReservation.js
const { Reservation } = require('../reservation');
const { ReservationRepository } = require('../reservationRepository');
const { eventPublisher } = require('../../infrastructure/eventPublisher');

const createReservationUseCase = {
  execute: async ({ userId, movieId, seats }) => {
    // Zwaliduj dane
    if (!userId || !movieId || !seats || seats <= 0) {
      throw new Error('Invalid data');
    }

    // Utwórz obiekt rezerwacji
    const reservation = new Reservation(userId, movieId, seats);

    // Zapisz rezerwację w repozytorium
    await ReservationRepository.save(reservation);

    // Wysyłamy zdarzenie
    eventPublisher.publish(reservation);

    return reservation;
  }
};

module.exports = { createReservationUseCase };
