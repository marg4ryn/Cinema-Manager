// src/app.js
const express = require('express');
const EventPublisher = require('./infrastructure/Publisher');
const EventListener = require('./infrastructure/PaymentEventListener');
const { PROCESS_PAYMENT } = require('./domain/PaymentEvents');

const app = express();
const port = 3000;

const publisher = new EventPublisher('amqp://localhost'); // Użyj odpowiedniego URL do RabbitMQ

// Parsowanie body w formacie JSON
app.use(express.json());

// Uruchomienie Publishera i EventListenera
async function setup() {
    await publisher.connect();

    const eventListener = new EventListener(publisher);
    await eventListener.listen();
}

setup().catch(console.error);

// Endpoint do procesowania płatności
app.post('/process-payment', async (req, res) => {
    const { reservationId } = req.body;

    if (!reservationId) {
        return res.status(400).json({ error: 'Reservation ID is required' });
    }

    console.log(`Received request to process payment for reservation ID: ${reservationId}`);

    // Publikowanie eventu PROCESS_PAYMENT
    await publisher.publish({
        eventName: PROCESS_PAYMENT,
        payload: {
            reservationId
        }
    });

    res.status(200).json({
        message: `Processing payment for reservation ID: ${reservationId}`
    });
});

// Endpoint do symulacji odpowiedzi płatności przez użytkownika (np. z Postmana)
app.get('/payment-response/:reservationId', async (req, res) => {
    const { reservationId } = req.params;

    // Możemy zwrócić status "approved", "declined", lub "no response"
    // Symulujemy odpowiedź użytkownika (np. przez Postmana)
    const randomResponse = Math.random() > 0.5 ? 'approved' : 'declined';
    console.log(`Response for ${reservationId}: ${randomResponse}`);

    res.json({ status: randomResponse });  // Zwrócenie odpowiedzi
});

// Uruchomienie serwera HTTP
app.listen(port, () => {
    console.log(`Payment service is running at http://localhost:${port}`);
});
