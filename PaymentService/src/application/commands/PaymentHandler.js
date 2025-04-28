// src/application/PaymentHandler.js

const logger = require('../infrastructure/logger/logger');
const { PAYMENT_EVENT, RESERVATION_EVENT, TICKET_EVENT } = require('../domain/events/events');
const EventPublisher = require('../infrastructure/events/EventPublisher');

class PaymentHandler {

    constructor(eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    // Główna metoda obsługująca zapytanie o zatwierdzenie płatności
    async handlePayment(event) {
        logger.info(`Received ProcessPayment event: ${JSON.stringify(event)}`);

        // Symulacja oczekiwania na odpowiedź użytkownika (Postman)
        const userResponse = await this.waitForUserResponse();

        // Decyzja na podstawie odpowiedzi
        if (userResponse === 'approved') {
            logger.info('Payment approved, processing further actions...');

            // Wysłanie eventu o udanej płatności i dalszym przetwarzaniu
            await this.eventPublisher.publish({
                eventName: PAYMENT_EVENT.PAYMENT_SUCCEEDED,
                data: { transactionId: event.transactionId, status: 'succeeded' }
            });

            // Po zatwierdzeniu płatności wysyłamy dwa eventy:
            // 1. Event nakazu wykonania rezerwacji
            await this.eventPublisher.publish({
                eventName: RESERVATION_EVENT.RESERVATION_REQUESTED,
                data: { transactionId: event.transactionId, seats: event.seats }
            });

            // 2. Event nakazu wygenerowania biletu
            await this.eventPublisher.publish({
                eventName: TICKET_EVENT.GENERATE_TICKET_REQUESTED,
                data: { transactionId: event.transactionId, user: event.user }
            });

        } else {
            // Jeśli płatność nie jest zatwierdzona, wysyłamy event niepowodzenia
            await this.eventPublisher.publish({
                eventName: PAYMENT_EVENT.PAYMENT_FAILED,
                data: { transactionId: event.transactionId, status: 'failed' }
            });
        }
    }

    // Symulacja oczekiwania na odpowiedź użytkownika przez 10 sekund
    async waitForUserResponse() {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Symulujemy, że użytkownik zatwierdza płatność
                // Możesz w Postmanie ręcznie ustawić odpowiedź na 'approved' lub 'rejected'
                resolve('approved'); // Zmiana na 'rejected' sprawi, że płatność nie powiedzie się
            }, 10000); // 10 sekund oczekiwania
        });
    }
}

module.exports = PaymentHandler;
