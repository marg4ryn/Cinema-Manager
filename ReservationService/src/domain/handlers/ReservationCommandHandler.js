const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const CommandHandler = require('@shared/cqrs/CommandHandler');
const PaymentRequestedEvent = require('@shared/events/events/PaymentRequestedEvent');
const SessionsSentCommand = require('../commands/SessionsSentCommand');
const ReservationsSentCommand = require('../commands/ReservationsSentCommand');
const PaymentSucceededCommand = require('../commands/PaymentSucceededCommand');
const SessionStore = require('../../SessionStore');
const logger = require('@shared/logger/logger')

class ReservationCommandHandler extends CommandHandler{
  constructor(publisher, userResponseListener) {
    super();
    this.publisher = publisher;
    this.userResponseListener = userResponseListener;
  }

  async handle(command) {
    if (command instanceof SessionsSentCommand) {
      const sessions = command.sessions;
      SessionStore.setSessions(command.sessions);

      sessions.forEach(session => {
        logger.info(`Session ID: ${session._id}`);
        logger.info(`Movie Title: ${session.movieTitle}`);
        logger.info(`Start Time: ${session.startTime}`);
        logger.info(`Duration: ${session.durationMinutes} minutes`);
        logger.info(`Total seats: ${session.totalSeats}`);
        logger.info('-------------------------');
      });

      logger.info('Please select a session by providing the session ID and your email.');
    }

    else if (command instanceof ReservationsSentCommand) {
      const { sessionId, freeSeats, userEmail } = command;

      logger.info(`Received reservation for session: ${sessionId}`);
      logger.info(`User: ${userEmail}`);
      logger.info(`Available seats: ${freeSeats.join(', ')}`);

      const response = await this.userResponseListener.waitForReservations();
      const selectedSeats = response;

      const allSeatsAvailable = selectedSeats.every(seat => freeSeats.includes(seat));
      if (!allSeatsAvailable) {
        logger.error(`Reservation failed: Some selected seats [${selectedSeats.join(', ')}] are no longer available.`);
        return;
      }

      const reservationId = new mongoose.Types.ObjectId();

      const paymentRequestedEvent = new PaymentRequestedEvent(userEmail, reservationId, selectedSeats, sessionId);
      this.publisher.publish(paymentRequestedEvent)
    }

    else if (command instanceof PaymentSucceededCommand) {
      const {userEmail, reservationId, selectedPlaces, sessionId} = command;

      if (!Array.isArray(selectedPlaces)) {
          logger.error('selectedPlaces is not a valid array');
          return;
      }

      const reservation = new Reservation({
        _id: reservationId,
        sessionId: sessionId,
        userEmail: userEmail,
        seats: selectedPlaces
      });

      try {
        await reservation.save();
        logger.info(`Reservation saved successfully for session ${sessionId}, seats: ${selectedPlaces.join(', ')}`);
      } catch (error) {
        logger.error('Failed to save reservation:', error);
      }
    }

    else {
      logger.error('Unknown command type');
    }
  }
}

module.exports = ReservationCommandHandler;
