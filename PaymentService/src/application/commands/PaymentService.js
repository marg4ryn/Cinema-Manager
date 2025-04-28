// src/application/PaymentService.js

const EventListener = require('../infrastructure/events/EventListener');
const PaymentHandler = require('./PaymentHandler');
const EventPublisher = require('../infrastructure/events/EventPublisher');
const logger = require('../infrastructure/logger/logger');
const { PAYMENT_EVENT } = require('../domain/events/events');

class PaymentService {
    constructor(rabbitUrl) {
        this.rabbitUrl = rabbitUrl;
        this.listener = new EventListener(rabbitUrl);
        this.eventPublisher = new EventPublisher(rabbitUrl);
        this.handler = new PaymentHandler(this.eventPublisher);
    }

    // Uruchomienie listenera i subskrypcja na eventy
    async start() {
        await this.listener.connect();

        // Subskrypcja na event ProcessPayment
        await this.listener.subscribe(PAYMENT_EVENT.PROCESS_PAYMENT, async (event) => {
            await this.handler.handlePayment(event);
        });

        console.log('PaymentService started and listening for events...');
    }

    // Zamknięcie listenera
    async close() {
        await this.listener.close();
    }
}

module.exports = PaymentService;
