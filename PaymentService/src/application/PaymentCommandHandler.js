// src/application/PaymentCommandHandler.js
const logger = require('../infrastructure/logging/logger');
const { CANCEL_RESERVATION_REQUEST, GENERATE_TICKET_REQUEST } = require('../../domain/PaymentEvents');
const axios = require('axios');  // Możemy użyć axios do symulacji zapytania HTTP, np. z Postmana.

class PaymentCommandHandler {
    // Obsługuje proces płatności, ale tylko po otrzymaniu zdarzenia PROCESS_PAYMENT
    async handleProcessPayment(event, publisher) {
        logger.info(`Processing payment for reservation ID: ${event.payload.reservationId}`);

        // Czekamy na odpowiedź użytkownika przez 30 sekund
        const userResponse = await this.getUserResponse(event.payload.reservationId);

        if (userResponse === 'approved') {
            logger.info(`Payment approved for reservation ID: ${event.payload.reservationId}`);
            // Wysyłamy event o sukcesie płatności
            await publisher.publish({
                eventName: GENERATE_TICKET_REQUEST,
                payload: {
                    reservationId: event.payload.reservationId
                }
            });
        } else if (userResponse === 'declined') {
            logger.info(`Payment declined for reservation ID: ${event.payload.reservationId}`);
            // Wysyłamy event o anulowaniu rezerwacji
            await publisher.publish({
                eventName: CANCEL_RESERVATION_REQUEST,
                payload: {
                    reservationId: event.payload.reservationId
                }
            });
        } else {
            // Wysyłamy event o anulowaniu rezerwacji, jeśli brak odpowiedzi
            logger.info(`No payment response received for reservation ID: ${event.payload.reservationId}`);
            await publisher.publish({
                eventName: CANCEL_RESERVATION_REQUEST,
                payload: {
                    reservationId: event.payload.reservationId
                }
            });
        }
    }

    // Funkcja oczekująca na odpowiedź użytkownika przez 30 sekund
    async getUserResponse(reservationId) {
        // Zakładając, że masz endpoint do zatwierdzenia płatności
        const url = `http://localhost:3000/payment-response/${reservationId}`;

        try {
            // Oczekiwanie na odpowiedź przez 30 sekund (opóźnienie)
            const response = await axios.get(url, { timeout: 30000 });

            if (response.data.status === 'approved') {
                return 'approved';
            } else if (response.data.status === 'declined') {
                return 'declined';
            }
            return null;
        } catch (error) {
            // Jeśli nie otrzymamy odpowiedzi, traktujemy to jako brak odpowiedzi
            logger.error(`Payment response timeout for reservation ID: ${reservationId}`);
            return null;
        }
    }
}

module.exports = PaymentCommandHandler;
