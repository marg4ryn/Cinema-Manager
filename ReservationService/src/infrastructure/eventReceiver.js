// src/infrastructure/eventReceiver.js
const amqp = require('amqplib');

let channel = null;
let connection = null;

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect('amqp://localhost'); // lub połączenie z chmurą
    channel = await connection.createChannel();
    await channel.assertQueue('reservationQueue', { durable: true });
    console.log('Połączono z RabbitMQ do odbioru');
  } catch (error) {
    console.error('Błąd połączenia z RabbitMQ:', error);
  }
}

async function startListening() {
  if (!channel) {
    await connectRabbitMQ(); // Jeśli połączenie nie istnieje, nawiąż nowe
  }

  // Subskrybowanie kolejki 'reservationQueue'
  channel.consume('reservationQueue', (message) => {
    const event = JSON.parse(message.content.toString());

    // Reakcja na zdarzenie
    if (event.type === 'ReservationCreated') {
      console.log('Otrzymano zdarzenie:', event.type);
      // Tutaj możesz podjąć odpowiednie akcje, np. aktualizować status w bazie danych
    }

    // Potwierdzenie odbioru wiadomości
    channel.ack(message);
  });
}

module.exports = { startListening };
