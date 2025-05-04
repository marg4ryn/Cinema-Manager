const express = require('express');
const router = express.Router();

const paymentResponses = new Map();

router.post('/payment-response/:reservationId', (req, res) => {
    const { status } = req.body;
    const { reservationId } = req.params;

    if (!['yes', 'no'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    paymentResponses.set(reservationId, status);
    res.status(200).json({ message: 'Response recorded' });
});

router.get('/payment-response/:reservationId', (req, res) => {
    const { reservationId } = req.params;
    const status = paymentResponses.get(reservationId);

    if (!status) {
        return res.status(404).json({ message: 'No response' });
    }

    res.status(200).json({ status });
});

module.exports = router;
