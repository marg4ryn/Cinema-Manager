const Reservation = require('../models/Reservation');
const QueryHandler = require('@shared/cqrs/QueryHandler');
const logger = require('@shared/logger/logger');
const ReservationsSentCommand = require('../commands/ReservationsSentCommand');

class ReservationQueryHandler extends QueryHandler {
    constructor(commandHandler) {
        super();
        this.commandHandler = commandHandler;
        this.availableSeatsBySession = {};
    }

    async execute(query) {
        try {
            const sessionId = query.sessionId;
            const totalSeats = query.totalSeats;
            const userEmail = query.userEmail;
            logger.info(`Received query: ${JSON.stringify(query)}`);
            logger.info(`Fetching reservations for sessionId: ${sessionId} for user: ${userEmail}`);

            const reservations = await Reservation.find({ sessionId }).lean();
            const reservedSeats = reservations.flatMap(r => r.seats);
            const allSeats = Array.from({ length: totalSeats }, (_, i) => i + 1);
            const freeSeats = allSeats.filter(seat => !reservedSeats.includes(seat));

            this.availableSeatsBySession[sessionId] = freeSeats;

            logger.info(`Session: ${sessionId}`);
            logger.info(`Total number of seats: ${totalSeats}`);
            logger.info(`Reserved seats: [${reservedSeats.join(', ')}]`);
            logger.info(`Available places: [${freeSeats.join(', ')}]`);

            const reservationsSentCommand = new ReservationsSentCommand(sessionId, freeSeats, userEmail);
            this.commandHandler.handle(reservationsSentCommand);
        } catch (error) {
            logger.error(`Error handling movie session fetch:`, error);
        }
    }
}

module.exports = ReservationQueryHandler;
