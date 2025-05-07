const mongoose = require('mongoose');
const MovieSession = require('../models/MovieSession');

const movieTitles = ['Inception', 'The Matrix', 'Interstellar', 'The Dark Knight', 'Pulp Fiction'];
const rooms = ['Room 1', 'Room 2', 'Room 3'];

class MovieCommandHandler {
    async seedMovieSessions() {
        try {
            await MovieSession.deleteMany({});

            const sessions = [];

            for (let i = 0; i < 10; i++) {
                const title = movieTitles[i % movieTitles.length];
                const room = rooms[i % rooms.length];
                const startTime = new Date(Date.now() + i * 3600 * 1000); 
                const duration = 120 + (i % 3) * 15;
                const totalSeats = 50 + (i % 5) * 10;

                sessions.push({
                    movieTitle: title,
                    startTime,
                    durationMinutes: duration,
                    room,
                    totalSeats
                });
            }

            await MovieSession.insertMany(sessions);
            console.log('Movie sessions seeded successfully');
        } catch (error) {
            console.error('Error seeding movie sessions:', error);
        }
    }
}
module.exports = MovieCommandHandler;
