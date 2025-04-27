const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  userId: String,
  movieId: String,
  seats: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reservation', reservationSchema);
