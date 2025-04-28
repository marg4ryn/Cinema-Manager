const EventPublisher = require('./EventPublisher');
const EventListener = require('./EventListener');
const MovieQueryHandler = require('../../application/MovieQueryHandler');
const { MOVIE_SESSION_REQUEST, MOVIE_SESSION_RESPONSE } = require('../../domain/MovieEvents');
const logger = require('../logging/logger');

async function setupMovieEvents(rabbitUrl) {
    const publisher = new EventPublisher(rabbitUrl, MOVIE_SESSION_RESPONSE);
    await publisher.connect();

    const subscriber = new EventListener(rabbitUrl, MOVIE_SESSION_REQUEST);
    await subscriber.connect();

    try {
        await subscriber.subscribe(async (event) => {
        logger.info(`Received event: ${event.eventName}`);

        const sessions = await MovieQueryHandler.handle(event.payload);

        await publisher.publish({
            eventName: MOVIE_SESSION_RESPONSE,
            payload: { sessions }
        });

        logger.info('Published movie sessions response');
    });
    } catch (error) {
        logger.error(`Error in event handling: ${error.message}`);
    }
}

module.exports = { setupMovieEvents };
