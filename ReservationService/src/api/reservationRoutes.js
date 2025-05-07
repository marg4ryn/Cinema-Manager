const express = require('express');
const router = express.Router();
const reservationCommandController = require('../controllers/reservationCommandController');

router.post('/', reservationCommandController.createReservation);

module.exports = router;
