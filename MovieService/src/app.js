const express = require('express');
const mongoose = require('mongoose');
const { setupMovieEvents } = require('./infrastructure/events/MovieEventHandler');
const logger = require('./infrastructure/logging/logger');

const app = express();
app.use(express.json());

const start = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/movieservice');
        logger.info('Connected to MongoDB');

        await setupMovieEvents('amqp://localhost');

        app.listen(3000, () => {
            logger.info('MovieService running on port 3000');
        });
    } catch (error) {
        console.error(error);
        logger.error(error.message);
        process.exit(1);
    }
};

start();
