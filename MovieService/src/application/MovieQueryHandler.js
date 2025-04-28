const MovieSession = require('../domain/MovieSession');

class MovieQueryHandler {
    async handle(movieTitle) {
        const movieSession = await MovieSession.findOne({ movieTitle });

        if (!movieSession) {
            throw new Error('Movie session not found');
        }

        return movieSession;
    }
}

module.exports = MovieQueryHandler;
