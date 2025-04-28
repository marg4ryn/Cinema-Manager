const EventPublisher = require('./EventPublisher');
const EventSubscriber = require('./EventSubscriber');
const GetMovieSessionsHandler = require('../../application/queries/GetMovieSessionsHandler');
const { MOVIE_SESSION_REQUESTED, MOVIE_SESSION_RESPONSE } = require('../../domain/events/MovieEvents');
const logger = require('../logger/logger');

async function setupMovieEvents(rabbitUrl) {
    const publisher = new EventPublisher(rabbitUrl, MOVIE_SESSION_RESPONSE);
    await publisher.connect();

    const subscriber = new EventSubscriber(rabbitUrl, MOVIE_SESSION_REQUESTED);
    await subscriber.connect();

    try {
        await subscriber.subscribe(async (event) => {
        logger.info(`Received event: ${event.eventName}`);

        const sessions = await GetMovieSessionsHandler.handle(event.payload);

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
