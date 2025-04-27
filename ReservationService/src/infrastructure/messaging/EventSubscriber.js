const amqp = require('amqplib');

async function startSubscriber() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  const exchange = 'events';
  await channel.assertExchange(exchange, 'fanout', { durable: false });

  const q = await channel.assertQueue('', { exclusive: true });
  console.log(`[*] Waiting for events in queue: ${q.queue}`);
  
  channel.bindQueue(q.queue, exchange, '');

  channel.consume(q.queue, (msg) => {
    if (msg.content) {
      const event = JSON.parse(msg.content.toString());
      console.log(`[>] Event received: ${event.type}`, event.payload);
    }
  }, {
    noAck: true
  });
}

startSubscriber();
