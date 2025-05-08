const BaseEvent = require('./BaseEvent');

class PaymentRequestedEvent extends BaseEvent {
  static eventName = 'PaymentRequested';
  constructor(userEmail, reservationId) {
    super('PaymentRequested', { userEmail, reservationId });
  }
}

module.exports = PaymentRequestedEvent;
