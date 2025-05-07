const MovieSession = require('../models/MovieSession');
const MOVIE_EVENTS = require('../events/MovieEvents');

class MovieQueryHandler {
    constructor(eventPublisher, logger) {
        this.eventPublisher = eventPublisher;
        this.logger = logger;
    }

    async handle(event) {
        try {
            this.logger.info(`Fetching all movie sessions from MongoDB`);

            const sessions = await MovieSession.find({}).lean();

            await this.eventPublisher.publish({
                eventName: MOVIE_EVENTS.SESSIONS_SENT,
                payload: {
                    sessions,
                }
            });

            this.logger.info(`Movie sessions sent successfully`);
        } catch (error) {
            this.logger.error(`Error handling movie session fetch:`, error);
        }
    }
}

module.exports = MovieQueryHandler;
