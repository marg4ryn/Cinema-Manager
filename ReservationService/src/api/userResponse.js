const ReservationCommandHandler = require('../domain/handlers/ReservationCommandHandler');
const ReservationQueryHandler = require('../domain/handlers/ReservationQueryHandler');
const GetReservationsQuery = require('../domain/queries/GetReservationsQuery');
const HttpUserResponseListener = require('../api/HttpUserResponseListener');
const Publisher = require('@shared/events/EventPublisher');
const sessionStore = require('../SessionStore');

module.exports = (app, httpUserResponseListener) => {
  app.post('/select-session', async (req, res) => {
  const { answer } = req.body;

    if (!answer) {
      return res.status(400).send({ error: 'Missing answer field' });
    }

    const [sessionId, userEmail] = answer.trim().split(/\s+/);

    const latestSessions = sessionStore.getSessions();
    const selectedSession = latestSessions.find(s => s._id.toString() === sessionId);
    if (!selectedSession) {
      logger.error('Invalid session ID');
      return res.status(400).send({ error: 'Invalid session ID' });
    }

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail);
    if (!isEmailValid) {
      logger.error('Invalid email format');
      return res.status(400).send({ error: 'Invalid email format' });
    }

    const totalSeats = selectedSession.totalSeats;
    const query = new GetReservationsQuery(sessionId, totalSeats, userEmail);
    const queryHandler = new ReservationQueryHandler(new ReservationCommandHandler(new Publisher(), new HttpUserResponseListener()));

    await queryHandler.execute(query);

    res.status(200).send({ status: 'Reservation query sent' });
  });

  app.post('/select-seat', (req, res) => {
    const { answer } = req.body;
    httpUserResponseListener.registerResponse('seat', answer);
    res.status(200).send({ status: 'received' });
  });
};
