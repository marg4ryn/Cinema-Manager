const amqp = require('amqplib');

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

    // Publikowanie eventu
    async publish(event) {
        const queue = event.eventName;
        await this.channel.assertQueue(queue, { durable: true });
        this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(event)));
        console.log(`Event published: ${event.eventName}`);
    }

    // Zamknięcie połączenia
    async close() {
        await this.channel.close();
        await this.connection.close();
    }
}

module.exports = EventPublisher;
