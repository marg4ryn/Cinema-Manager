class EventListener {
    constructor(channel, handlerMap, logger) {
        this.channel = channel;
        this.handlerMap = handlerMap;
        this.logger = logger;
    }

    async startListening(queueName) {
        this.logger.info(`Listening on channel: ${queueName}`);
        await this.channel.assertQueue(queueName);

        this.channel.consume(queueName, async (msg) => {
            if (msg !== null) {
                const event = JSON.parse(msg.content.toString());
                this.logger.info(`Received event: ${event.eventName}`);

                const handler = this.handlerMap[event.eventName];
                if (handler) {
                    await handler.handle(event);
                } else {
                    this.logger.warn(`No handler for event: ${event.eventName}`);
                }

                this.channel.ack(msg);
            }
        });
    }
}

module.exports = EventListener;
