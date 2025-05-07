const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  sessionId: ObjectId,
  userEmail: String,
  seats: [Number],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reservation', reservationSchema);
