const BaseEvent = require('./BaseEvent');

class SessionsSentEvent extends BaseEvent {
  static eventName = 'SessionsSent';
  constructor(sessions) {
    super('SessionsSent', {sessions});
  }
}

module.exports = SessionsSentEvent;
