const mongoose = require('mongoose');

const movieSessionSchema = new mongoose.Schema({
    movieTitle: { type: String, required: true },
    startTime: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
    room: { type: String, required: true },
    totalSeats: { type: Number, required: true }
});

const MovieSession = mongoose.model('MovieSession', movieSessionSchema);

module.exports = MovieSession;
