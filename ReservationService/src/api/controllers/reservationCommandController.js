const CreateReservationHandler = require('../../domain/handlers/commandHandlers/CreateReservationHandler');

exports.createReservation = async (req, res) => {
  const { userId, movieId, seats } = req.body;
  const command = { userId, movieId, seats };
  
  const reservation = await CreateReservationHandler.handle(command);
  
  res.status(201).json(reservation);
};
