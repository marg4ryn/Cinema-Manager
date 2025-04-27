// src/infrastructure/reservationMongoRepository.js
const mongoose = require('mongoose');
const { Reservation } = require('../domain/reservation');

// Definicja schematu MongoDB
const reservationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  movieId: { type: String, required: true },
  seats: { type: Number, required: true },
  createdAt: { type: Date, required: true }
});

const ReservationModel = mongoose.model('Reservation', reservationSchema);

// Repozytorium MongoDB
const ReservationMongoRepository = {
  save: async (reservation) => {
    const newReservation = new ReservationModel(reservation);
    await newReservation.save();
  },
};

module.exports = { ReservationMongoRepository };
