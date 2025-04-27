const amqp = require('amqplib');

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
      console.log(`[x] Event published: ${message}`);

      setTimeout(() => {
        connection.close();
      }, 500);
      
    } catch (error) {
      console.error('Failed to publish event', error);
    }
  }
}

module.exports = EventPublisher;
