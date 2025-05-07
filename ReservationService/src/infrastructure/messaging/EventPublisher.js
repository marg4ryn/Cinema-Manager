class EventPublisher {
    constructor(channel, queue) {
        this.channel = channel;
        this.queue = queue;
    }

    async publish(event) {
        await this.channel.assertQueue(this.queue);
        this.channel.sendToQueue(this.queue, Buffer.from(JSON.stringify(event)));
    }
}

module.exports = EventPublisher;
