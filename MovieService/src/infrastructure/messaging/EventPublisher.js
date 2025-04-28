const amqp = require('amqplib');

class EventPublisher {
    constructor(rabbitUrl) {
        this.rabbitUrl = rabbitUrl;
        this.connection = null;
        this.channel = null;
    }

    async connect() {
        this.connection = await amqp.connect(this.rabbitUrl);
        this.channel = await this.connection.createChannel();
    }

    async publish(event) {
        const queue = event.eventName;
        await this.channel.assertQueue(queue, { durable: true });
        this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(event)));
        console.log(`Event published: ${event.eventName}`);
    }

    async subscribe(eventName, handler) {
        await this.channel.assertQueue(eventName, { durable: true });
        this.channel.consume(eventName, async (msg) => {
            if (msg !== null) {
                const event = JSON.parse(msg.content.toString());
                await handler(event);
                this.channel.ack(msg);
            }
        });
    }

    async close() {
        await this.channel.close();
        await this.connection.close();
    }
}

module.exports = EventPublisher;
