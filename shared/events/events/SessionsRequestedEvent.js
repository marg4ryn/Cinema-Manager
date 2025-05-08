const BaseEvent = require('./BaseEvent');

class SessionsRequestedEvent extends BaseEvent {
  static eventName = 'SessionsRequested';
  constructor() {
    super('SessionsRequested', {});
  }
}

module.exports = SessionsRequestedEvent;
