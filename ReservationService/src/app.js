const express = require('express');
const mongoose = require('mongoose');
const EventBus = require('./infrastructure/messaging/EventBus');
const reservationRoutes = require('./api/routes/reservationRoutes');
const logger = require('./infrastructure/logging/logger');

const eventBus = new EventBus('amqp://localhost');

const app = express();

app.use(express.json());
app.use('/api/reservations', reservationRoutes);

mongoose.set('strictQuery', true); 
mongoose.connect('mongodb://localhost:27017/reservation', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => logger.info('MongoDB connected'))
  .catch(err => logger.error('MongoDB connection error: ' + err));

async function startApp() {
  await eventBus.connect();
}

startApp();

module.exports = app;
