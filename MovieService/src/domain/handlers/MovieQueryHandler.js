const MovieSession = require('../models/MovieSession');
const QueryHandler = require('@shared/cqrs/QueryHandler');
const SessionsSentEvent = require('@shared/events/events/SessionsSentEvent');
const logger = require('@shared/logger/logger');

class MovieQueryHandler extends QueryHandler {
     
    async execute(query, publisher) {
        try {
            logger.info(`Fetching all movie sessions from MongoDB`);

            const sessions = await MovieSession.find({}).lean();
            const sessionsSentEvent = new SessionsSentEvent(sessions);
            publisher.publish(sessionsSentEvent)

            logger.info(`Movie sessions sent successfully`);
        } catch (error) {
            logger.error(`Error handling movie session fetch:`, error);
        }
    }
}

module.exports = MovieQueryHandler;
