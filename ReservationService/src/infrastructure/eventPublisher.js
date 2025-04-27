// src/infrastructure/eventPublisher.js
const amqp = require('amqplib');
const { ReservationCreatedEvent } = require('../domain/events/reservationCreatedEvent');

let channel = null;
let connection = null;

async function connectRabbitMQ() {
  try {
    // Połączenie z RabbitMQ
    connection = await amqp.connect('amqp://localhost'); // lub połączenie z chmurą
    channel = await connection.createChannel();
    await channel.assertQueue('reservationQueue', { durable: true });
    console.log('Połączono z RabbitMQ');
  } catch (error) {
    console.error('Błąd połączenia z RabbitMQ:', error);
  }
}

const eventPublisher = {
  publish: async (reservation) => {
    if (!channel) {
      await connectRabbitMQ(); // Jeśli połączenie nie istnieje, nawiąż nowe
    }
    const event = new ReservationCreatedEvent(reservation);
    const message = JSON.stringify(event);

    // Wysłanie zdarzenia do kolejki
    channel.sendToQueue('reservationQueue', Buffer.from(message), { persistent: true });
    console.log('Wysłano zdarzenie:', event.type);
  },
};

module.exports = { eventPublisher };
