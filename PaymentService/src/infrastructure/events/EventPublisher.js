// src/infrastructure/events/EventPublisher.js

const amqp = require('amqplib');
const logger = require('../logger/logger');

class EventPublisher {
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

    // Publikowanie eventu do RabbitMQ
    async publish(event) {
        const queue = event.eventName;
        await this.channel.assertQueue(queue, { durable: true });
        this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(event)));
        logger.info(`Event published: ${event.eventName}`);
    }

    // Zamknięcie połączenia
    async close() {
        await this.channel.close();
        await this.connection.close();
    }
}

module.exports = EventPublisher;
