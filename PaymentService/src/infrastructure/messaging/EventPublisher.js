const logger = require('../logging/logger');
const amqp = require('amqplib');

class EventPublisher {
    constructor(channel) {
        this.channel = channel;
    }

    async publish(event) {
        const queue = event.eventName;
        await this.channel.assertQueue(queue, { durable: true });
        this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(event)));
        logger.info(`Event published: ${event.eventName}`);
    }

    async close() {
        await this.channel.close();
        await this.connection.close();
    }
}

module.exports = EventPublisher;
