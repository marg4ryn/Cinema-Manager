const amqp = require('amqplib');
const logger = require('../logging/logger');

class EventPublisher {
  static async publish(eventType, payload) {
    try {
      const connection = await amqp.connect('amqp://localhost');
      const channel = await connection.createChannel();

      const exchange = 'events';
      await channel.assertExchange(exchange, 'fanout', { durable: false });

      const message = JSON.stringify({
        type: eventType,
        payload
      });

      channel.publish(exchange, '', Buffer.from(message));
      logger.info(`[x] Event published: ${message}`);

      setTimeout(() => {
        connection.close();
      }, 500);
      
    } catch (error) {
       logger.error('Failed to publish event', error);
    }
  }
}

module.exports = EventPublisher;
