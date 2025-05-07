const BaseEvent = require('./BaseEvent');

class TicketGeneratedEvent extends BaseEvent {
  static eventName = 'TicketGenerated';
  constructor(userEmail, ticket) {
    super('TicketGenerated', { userEmail, ticket });
  }
}

module.exports = TicketGeneratedEvent;
