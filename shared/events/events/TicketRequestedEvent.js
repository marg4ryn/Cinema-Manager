const BaseEvent = require('./BaseEvent');

class TicketRequestedEvent extends BaseEvent {
  static eventName = 'TicketRequested';
  constructor(userEmail) {
    super('TicketRequested', { userEmail });
  }
}

module.exports = TicketRequestedEvent;
