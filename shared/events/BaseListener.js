class BaseListener {
    constructor(channel, handler, logger, coreEvent) {
      if (!channel || !handler || !logger) {
        throw new Error('channel, handler, logger and coreEvent are required');
      }
      this.channel = channel;
      this.handler = handler;
      this.logger = logger;
      this.coreEvent = coreEvent;
    }
  }
  
  module.exports = { BaseListener };
  