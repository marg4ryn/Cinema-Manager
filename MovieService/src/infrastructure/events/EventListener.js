const amqp = require('amqplib');

class EventListener {
  constructor(rabbitUrl, queueName) {
    this.rabbitUrl = rabbitUrl;
    this.queueName = queueName;
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    this.connection = await amqp.connect(this.rabbitUrl);
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue(this.queueName, { durable: true });
  }

  async subscribe(handler) {
    if (!this.channel) {
      throw new Error('Channel is not established. Call connect() first.');
    }

    this.channel.consume(this.queueName, async (msg) => {
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

module.exports = EventListener;
