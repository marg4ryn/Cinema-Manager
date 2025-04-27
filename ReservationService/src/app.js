const express = require('express');
const mongoose = require('mongoose');
const reservationController = require('./api/reservationController');

const app = express();
app.use(express.json());
app.use('/api', reservationController);

mongoose.connect('mongodb://localhost:27017/reservationService', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

module.exports = app;
