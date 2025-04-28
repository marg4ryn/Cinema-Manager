// src/infrastructure/events/EventListener.js

const amqp = require('amqplib');
const logger = require('../logger/logger');

class EventListener {
    constructor(rabbitUrl) {
        this.rabbitUrl = rabbitUrl;
        this.connection = null;
        this.channel = null;
    }

    // Połączenie z RabbitMQ
    async connect() {
        this.connection = await amqp.connect(this.rabbitUrl);
        this.channel = await this.connection.createChannel();
    }

    // Subskrypcja eventów
    async subscribe(eventName, handler) {
        await this.channel.assertQueue(eventName, { durable: true });
        this.channel.consume(eventName, async (msg) => {
            if (msg !== null) {
                const event = JSON.parse(msg.content.toString());
                await handler(event);  // Wywołanie handlera
                this.channel.ack(msg);  // Potwierdzenie odbioru wiadomości
            }
        });
    }

    // Zamknięcie połączenia
    async close() {
        await this.channel.close();
        await this.connection.close();
    }
}

module.exports = EventListener;
