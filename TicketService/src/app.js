const express = require('express');
const mongoose = require('mongoose');
const { setupTicketEvents } = require('./infrastructure/events/TicketEventHandler');
const logger = require('./infrastructure/logger/logger');

const app = express();
app.use(express.json());

const start = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/ticketservice');
        console.log('Connected to MongoDB');

        await setupTicketEvents('amqp://localhost');

        app.listen(3001, () => {
            console.log('TicketService running on port 3001');
            logger.info('TicketService started successfully.');
        });
    } catch (error) {
        console.error(error);
        logger.error(error.message);
        process.exit(1);
    }
};

start();
