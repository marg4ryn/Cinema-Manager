const logger = require('../logging/logger');
const MovieQueryHandler = require('../../application/MovieQueryHandler');
const { MOVIE_SESSION_REQUEST, MOVIE_SESSION_RESPONSE } = require('../../domain/MovieEvents');

class MovieEventListener {
    constructor(publisher) {
        this.publisher = publisher;
        this.movieQueryHandler = new MovieQueryHandler();
    }

    async listen() {
        // Subskrybujemy zdarzenie MOVIE_SESSION_REQUEST
        await this.publisher.subscribe(MOVIE_SESSION_REQUEST, this.handleMovieSessionRequest.bind(this));
    }

    async handleMovieSessionRequest(event) {
        logger.info(`Received event: ${event.eventName}`);
        try {
            // Obsługujemy zapytanie o dane sesji filmu
            const movieSession = await this.movieQueryHandler.handle(event.payload.movieTitle);

            // Wysłanie odpowiedzi jako MOVIE_SESSION_RESPONSE
            await this.publisher.publish({
                eventName: MOVIE_SESSION_RESPONSE,
                payload: movieSession
            });
        } catch (error) {
            logger.error(`Error handling movie session request: ${error.message}`);
        }
    }
}

module.exports = MovieEventListener;
