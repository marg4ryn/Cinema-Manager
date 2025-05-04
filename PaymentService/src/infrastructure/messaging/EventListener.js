class EventListener {
    constructor(channel, handler, logger) {
        this.channel = channel;
        this.handler = handler;
        this.logger = logger;
    }

    async startListening(queueName) {
        await this.channel.assertQueue(queueName);

        this.channel.consume(queueName, async (msg) => {
            if (msg !== null) {
                const event = JSON.parse(msg.content.toString());
                this.logger.info(`Received event: ${event.eventName}`);
                await this.handler.handle(event);
                this.channel.ack(msg);
            }
        });
    }
}

module.exports = EventListener;
