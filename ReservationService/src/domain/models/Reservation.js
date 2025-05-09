const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const reservationSchema = new Schema({
  sessionId: Types.ObjectId,
  userEmail: String,
  seats: [Number],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reservation', reservationSchema);
