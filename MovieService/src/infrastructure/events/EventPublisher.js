const amqp = require('amqplib');

class EventPublisher {
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

  async publish(event) {
    if (!this.channel) {
      throw new Error('Channel is not established. Call connect() first.');
    }
    this.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(event)));
  }

  async close() {
    await this.channel.close();
    await this.connection.close();
  }
}

module.exports = EventPublisher;
