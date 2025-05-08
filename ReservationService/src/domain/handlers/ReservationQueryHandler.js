const Reservation = require('../models/Reservation');
const QueryHandler = require('@shared/cqrs/QueryHandler');
const logger = require('@shared/logger/logger');

class MovieQueryHandler extends QueryHandler {
    constructor(commandHandler) {
        this.commandHandler = commandHandler;
        this.availableSeatsBySession = {};
    }

    async execute(query) {
        try {
            const sessionId = query.sessionId;
            const totalSeats = query.totalSeats;
            logger.info(`Fetching reservations for sessionId: ${sessionId}`);

            const reservations = await Reservation.find({ sessionId }).lean();
            const reservedSeats = reservations.flatMap(r => r.seats);
            const allSeats = Array.from({ length: totalSeats }, (_, i) => i + 1);
            const freeSeats = allSeats.filter(seat => !reservedSeats.includes(seat));

            this.availableSeatsBySession[sessionId] = freeSeats;

            this.logger.info(`Session: ${sessionId}`);
            this.logger.info(`Total number of seats: ${totalSeats}`);
            this.logger.info(`Reserved seats: [${reservedSeats.join(', ')}]`);
            this.logger.info(`Available places: [${freeSeats.join(', ')}]`);

            this.commandHandler.selectSeat(freeSeats);
        } catch (error) {
            this.logger.error(`Error handling movie session fetch:`, error);
        }
    }
}

module.exports = MovieQueryHandler;
