const MovieSession = require('../../domain/models/MovieSession');

class GetMovieSessionsHandler {
    async handle(query) {
        return await MovieSession.find({}); 
    }
}

module.exports = new GetMovieSessionsHandler();
