const GetReservationHandler = require('../../domain/handlers/queryHandlers/GetReservationHandler');

exports.getReservation = async (req, res) => {
  const reservationId = req.params.id;
  
  const reservation = await GetReservationHandler.handle({ id: reservationId });
  
  if (!reservation) {
    return res.status(404).json({ message: 'Reservation not found' });
  }

  res.status(200).json(reservation);
};
