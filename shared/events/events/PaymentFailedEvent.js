const BaseEvent = require('./BaseEvent');

class PaymentFailedEvent extends BaseEvent {
  static eventName = 'PaymentFailed';
  constructor(userEmail, reservationId) {
    super('PaymentFailed', { userEmail, reservationId });
  }
}

module.exports = PaymentFailedEvent;
