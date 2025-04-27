const express = require('express');
const { createReservationUseCase } = require('../domain/usecases/createReservation');

const router = express.Router();

// Endpoint do tworzenia rezerwacji
router.post('/reserve', async (req, res) => {
  const { userId, movieId, seats } = req.body;

  try {
    const reservation = await createReservationUseCase.execute({ userId, movieId, seats });
    res.status(201).json(reservation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
