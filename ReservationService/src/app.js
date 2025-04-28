const express = require('express');
const mongoose = require('mongoose');
const reservationRoutes = require('./api/routes/reservationRoutes');
const logger = require('./infrastructure/logging/logger');

const app = express();

app.use(express.json());
app.use('/api/reservations', reservationRoutes);

mongoose.set('strictQuery', true); 
mongoose.connect('mongodb://localhost:27017/reservation', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => logger.info('MongoDB connected'))
  .catch(err => logger.error('MongoDB connection error: ' + err));

module.exports = app;
