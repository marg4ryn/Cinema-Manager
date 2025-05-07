class EventPublisher {
    constructor(channel, logger) {
      this.channel = channel;
      this.logger = logger;
    }
  
    async publish(event) {
      if (!event?.eventName || !event?.payload) {
        throw new Error('The event must contain an eventName and payload');
      }
  
      await this.channel.assertQueue(event.eventName, { durable: true });
  
      const buffer = Buffer.from(JSON.stringify(event));
      this.channel.sendToQueue(event.eventName, buffer);
  
      this.logger.info(`Event published: ${event.eventName}`);
    }
  }
  
  module.exports = EventPublisher;
  