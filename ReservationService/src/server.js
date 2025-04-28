const app = require('./app');
const logger = require('./infrastructure/logging/logger');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Reservation Service running on port ${PORT}`);
});
