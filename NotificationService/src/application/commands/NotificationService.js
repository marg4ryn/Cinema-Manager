// src/application/NotificationService.js

const EventListener = require('../infrastructure/events/EventListener');
const NotificationHandler = require('./NotificationHandler');
const logger = require('../infrastructure/logger/logger');

class NotificationService {
    constructor(rabbitUrl) {
        this.rabbitUrl = rabbitUrl;
        this.listener = new EventListener(rabbitUrl);
        this.handler = new NotificationHandler();
    }

    // Uruchomienie listenera i subskrypcja na eventy
    async start() {
        await this.listener.connect();

        // Subskrypcja na eventy (tutaj tylko jeden handler)
        await this.listener.subscribe('CancelReservation', async (event) => {
            await this.handler.handleEvent(event);
        });

        await this.listener.subscribe('SendTicket', async (event) => {
            await this.handler.handleEvent(event);
        });

        console.log('NotificationService started and listening for events...');
    }

    // Zamknięcie listenera
    async close() {
        await this.listener.close();
    }
}

module.exports = NotificationService;
