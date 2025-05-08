const { BaseListener } = require('@shared/events/BaseListener');
const MovieQueryHandler = require('../domain/handlers/MovieQueryHandler');
const GetSessionsQuery = require('../domain/queries/GetSessionsQuery');
const coreEvent = require('@shared/events/events/SessionsRequestedEvent');
const logger = require('@shared/logger/logger');

class SessionsRequestedListener extends BaseListener {
  constructor(channel, publisher) {
    const handler = new MovieQueryHandler();
    super(channel, handler, logger, coreEvent);
    this.publisher = publisher;
  }

  async listen() {
    await this.channel.assertQueue(coreEvent.eventName, { durable: true });

    this.channel.consume(coreEvent.eventName, async (msg) => {
      if (msg !== null) {
        const event = JSON.parse(msg.content.toString());
        logger.info(`Received event: ${event.eventName}`)
        if (event.eventName === coreEvent.eventName) {
          const query = new GetSessionsQuery();
          await this.handler.execute(query, this.publisher);
        }
        this.channel.ack(msg);
      }
    });
  }
}

module.exports = SessionsRequestedListener;
